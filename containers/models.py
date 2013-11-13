# Copyright 2013 Evan Hazlett and contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from distutils.version import LooseVersion
from django.db import models
from django.contrib.auth.models import User
from docker import client
from django.conf import settings
from django.utils.translation import ugettext as _
from django.db.models import Q
from docker import client
from django.core.cache import cache
from shipyard import utils
import json
import hashlib
import requests
from shipyard.exceptions import ProtectedContainerError

HOST_CACHE_TTL = getattr(settings, 'HOST_CACHE_TTL', 15)
CONTAINER_KEY = '{0}:containers'
IMAGE_KEY = '{0}:images'

class Host(models.Model):
    name = models.CharField(max_length=64, null=True,
        unique=True)
    hostname = models.CharField(max_length=128, null=True,
        unique=True)
    port = models.SmallIntegerField(null=True, default=4243)
    enabled = models.NullBooleanField(null=True, default=True)

    def __unicode__(self):
        return self.name

    @property
    def version(self):
        c = self._get_client()
        data = c.version()
        return LooseVersion(data['Version'])

    def _get_client(self):
        url = self.hostname
        if 'unix' not in url:
            url ='{0}:{1}'.format(self.hostname, self.port)
            if not url.startswith('http'):
                url = 'http://{0}'.format(url)
        return client.Client(base_url=url)

    def _invalidate_container_cache(self):
        # invalidate cache
        key = CONTAINER_KEY.format(self.name)
        try:
            cache.delete_pattern('*{0}*'.format(key))
        except: # ignore cache bust errors
            pass

    def _invalidate_image_cache(self):
        # invalidate cache
        cache.delete(IMAGE_KEY.format(self.name))

    def _generate_container_cache_key(self, seed=None):
        gen_id = hashlib.sha224(self.name + str(seed)).hexdigest()
        key = '{0}:{1}'.format(CONTAINER_KEY.format(self.name), gen_id)
        return key

    def _load_container_data(self, container_id):
        c = self._get_client()
        meta = c.inspect_container(container_id)
        m, created = Container.objects.get_or_create(
            container_id=container_id, host=self)
        m.is_running = meta.get('State', {}).get('Running', False)
        m.meta = json.dumps(meta)
        m.save()

    @classmethod
    def get_all_containers(cls, show_all=False, owner=None):
        hosts = Host.objects.filter(enabled=True)
        containers = []
        # load containers
        if hosts:
            c_ids = []
            for h in hosts:
                for c in h.get_containers(show_all=show_all):
                    c_ids.append(utils.get_short_id(c.get('Id')))
            # return metadata objects
            containers = Container.objects.filter(container_id__in=c_ids).filter(
                Q(owner=None) | Q(owner=owner))
        return containers

    def invalidate_cache(self):
        self._invalidate_container_cache()
        self._invalidate_image_cache()

    def get_containers(self, show_all=False):
        c = self._get_client()
        key = self._generate_container_cache_key(show_all)
        containers = cache.get(key)
        container_ids = []
        if containers is None:
            try:
                containers = c.containers(all=show_all)
            except requests.ConnectionError:
                containers = []
            # update meta data
            for x in containers:
                # only get first 12 chars of id (for metatdata)
                c_id = utils.get_short_id(x.get('Id'))
                # ignore stopped containers
                self._load_container_data(c_id)
                container_ids.append(c_id)
            # set extra containers to not running
            Container.objects.filter(host=self).exclude(
                container_id__in=container_ids).update(is_running=False)
            cache.set(key, containers, HOST_CACHE_TTL)
        return containers

    def get_containers_for_user(self, user=None, show_all=False):
        containers = self.get_containers(show_all=show_all)
        # don't filter staff
        if user.is_staff:
            return containers
        # filter
        ids = [x.container_id for x in Container.objects.all() \
            if x.owner == None or x.owner == user]
        return [x for x in containers if x.get('Id') in ids]

    def get_images(self, show_all=False):
        c = self._get_client()
        key = IMAGE_KEY.format(self.name)
        images = cache.get(key)
        if images is None:
            try:
                # only show images with a repository name
                images = [x for x in c.images(all=show_all) if x.get('Repository')]
                cache.set(key, images, HOST_CACHE_TTL)
            except requests.ConnectionError:
                images = []
        return images

    def create_container(self, image=None, command=None, ports=[],
        environment=[], memory=0, description='', volumes=None, volumes_from='',
        privileged=False, binds=None, owner=None, hostname=None):

        if self.version < '0.6.5':
            port_exposes = ports
            port_bindings = None
        else:
            port_exposes = {}
            port_bindings = {}
            for port_str in ports:
                port_parts = port_str.split(':')
                if len(port_parts) == 3:
                    interface, port, mapping = port_parts
                elif len(port_parts) == 2:
                    interface = ''
                    port, mapping = port_parts
                else:
                    interface, mapping = ('','')
                    port = port_str
                if port.find('/') < 0:
                    port = "{0}/tcp".format(port)
                port_exposes[port] = {};
                port_bindings.setdefault(port, []).append({'HostIp': interface, 'HostPort': mapping})

        c = self._get_client()
        try:
            cnt = c.create_container(image=image, command=command, detach=True,
                ports=port_exposes, mem_limit=memory, tty=True, stdin_open=True,
                environment=environment, volumes=volumes,
                volumes_from=volumes_from, privileged=privileged,
                hostname=hostname)
        except:
            import traceback
            traceback.print_exc()
        c_id = cnt.get('Id')
        c.start(c_id, binds=binds, port_bindings=port_bindings)
        status = False
        # create metadata only if container starts successfully
        if c.inspect_container(c_id).get('State', {}).get('Running'):
            c, created = Container.objects.get_or_create(container_id=c_id,
                host=self)
            c.description = description
            c.owner = owner
            c.save()
            status = True
        # clear host cache
        self._invalidate_container_cache()
        return c_id, status

    def restart_container(self, container_id=None):
        from applications.models import Application
        c = self._get_client()
        c.restart(container_id)
        self._invalidate_container_cache()
        # reload containers to get proper port
        self.get_containers()
        # update hipache
        container = Container.objects.get(
            container_id=utils.get_short_id(container_id))
        apps = Application.objects.filter(containers__in=[container])
        for app in apps:
            app.update_config()

    def stop_container(self, container_id=None):
        c_id = utils.get_short_id(container_id)
        c = Container.objects.get(container_id=c_id)
        if c.protected:
            raise ProtectedContainerError(
                _('Unable to stop container.  Container is protected.'))
        c = self._get_client()
        c.stop(c_id)
        self._invalidate_container_cache()

    def get_container_logs(self, container_id=None):
        c = self._get_client()
        return c.logs(container_id)

    def destroy_container(self, container_id=None):
        c_id = utils.get_short_id(container_id)
        c = Container.objects.get(container_id=c_id)
        if c.protected:
            raise ProtectedContainerError(
                _('Unable to destroy container.  Container is protected.'))
        c = self._get_client()
        try:
            c.kill(c_id)
            c.remove_container(c_id)
        except client.APIError:
            # ignore 404s from api if container not found
            pass
        # remove metadata
        Container.objects.filter(container_id=c_id).delete()
        self._invalidate_container_cache()

    def import_image(self, repository=None):
        c = self._get_client()
        c.pull(repository)
        self._invalidate_image_cache()

    def build_image(self, path=None, tag=None):
        c = self._get_client()
        if path.startswith('http://') or path.startswith('https://') or \
        path.startswith('git://') or path.startswith('github.com/'):
            f = path
        else:
            f = open(path, 'r')
        c.build(f, tag)

    def remove_image(self, image_id=None):
        c = self._get_client()
        c.remove_image(image_id)
        self._invalidate_image_cache()

    def clone_container(self, container_id=None):
        c_id = utils.get_short_id(container_id)
        c = Container.objects.get(container_id=c_id)
        meta = c.get_meta()
        cfg = meta.get('Config')
        image = cfg.get('Image')
        command = ' '.join(cfg.get('Cmd'))
        # update port spec to specify the original NAT'd port
        port_mapping = meta.get('NetworkSettings').get('PortMapping')
        port_specs = []
        if port_mapping:
            for x,y in port_mapping.items():
                for k,v in y.items():
                    port_specs.append('{}/{}'.format(k,x.lower()))
        env = cfg.get('Env')
        mem = cfg.get('Memory')
        description = c.description
        volumes = cfg.get('Volumes')
        volumes_from = cfg.get('VolumesFrom')
        privileged = cfg.get('Privileged')
        owner = c.owner
        c_id, status = self.create_container(image, command, port_specs,
            env, mem, description, volumes, volumes_from, privileged, owner)
        return c_id, status

class Container(models.Model):
    container_id = models.CharField(max_length=96, null=True, blank=True)
    description = models.TextField(blank=True, null=True, default='')
    meta = models.TextField(blank=True, null=True, default='{}')
    is_running = models.BooleanField(default=True)
    host = models.ForeignKey(Host, null=True, blank=True)
    owner = models.ForeignKey(User, null=True, blank=True)
    protected = models.BooleanField(default=False)

    def __unicode__(self):
        d = self.container_id
        if d and self.description:
            d += ' ({0})'.format(self.description)
        return d

    @classmethod
    def get_running(cls, user=None):
        hosts = Host.objects.filter(enabled=True)
        containers = []
        if hosts:
            c_ids = []
            for h in hosts:
                for c in h.get_containers():
                    c_ids.append(utils.get_short_id(c.get('Id')))
            # return metadata objects
            containers = Container.objects.filter(container_id__in=c_ids).filter(
                Q(owner=None))
            if user:
                containers = containers.filter(Q(owner=request.user))
        return containers

    def is_public(self):
        if self.owner == None:
            return True
        else:
            return False

    def get_meta(self):
        return json.loads(self.meta)

    def get_applications(self):
        from applications.models import Application
        return Application.objects.filter(containers__in=[self])

    def get_ports(self):
        meta = self.get_meta()
        network_settings = meta.get('NetworkSettings', {})
        ports = {}
        if self.host.version < '0.6.5':
            # for verions prior to docker v0.6.5
            port_mapping = network_settings.get('PortMapping')
            for proto in port_mapping:
                for port, external_port in port_mapping[proto].items():
                    port_proto = "{0}/{1}".format(port, proto)
                    ports[port_proto] = { '0.0.0.0': external_port }
        else:
            # for versions after docker v0.6.5
            for port_proto, host_list in network_settings.get('Ports').items():
                for host in host_list or []:
                    ports[port_proto] = { host.get('HostIp'): host.get('HostPort') }
        return ports

    def get_memory_limit(self):
        mem = 0
        meta = self.get_meta()
        if meta:
            mem = int(meta.get('Config', {}).get('Memory')) / 1048576
        return mem

    def get_name(self):
        d = self.container_id
        if self.description:
            d = self.description
        return d
