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
from django.db import models
from distutils.version import LooseVersion
from docker import client
from django.core.cache import cache
from django.conf import settings
from django.db.models import Q
from django.utils.translation import ugettext as _
from uuid import uuid4
from containers.models import Container
import hashlib
import requests
import socket
import json

HOST_CACHE_TTL = getattr(settings, 'HOST_CACHE_TTL', 15)
CONTAINER_KEY = '{0}:containers'
IMAGE_KEY = '{0}:images'

def generate_agent_key():
    return str(uuid4()).replace('-', '')

class Host(models.Model):
    name = models.CharField(max_length=64, null=True,
        unique=True)
    hostname = models.CharField(max_length=128, null=True,
            unique=True, help_text=_('Host/IP/Socket to connect to Docker'))
    public_hostname = models.CharField(max_length=128, null=True, blank=True,
            help_text=_('Hostname/IP used for applications (if different from hostname)'))
    port = models.SmallIntegerField(null=True, default=4243)
    agent_key = models.CharField(max_length=64, null=True,
            default=generate_agent_key, help_text=_('Agent Key'))
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
                    c_ids.append(c.get('Id'))
            # return metadata objects
            containers = Container.objects.filter(container_id__in=c_ids).filter(
                Q(owner=None) | Q(owner=owner)).order_by('id')
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
                c_id = x.get('Id')
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
        privileged=False, binds=None, links=None, name=None, owner=None,
        hostname=None, **kwargs):

        if isinstance(ports, str):
            ports = ports.split(',')
        if self.version < '0.6.5':
            port_exposes = ports
            port_bindings = None
        else:
            port_exposes = {}
            port_bindings = {}
            for port_str in ports:
                port_parts = port_str.split(':')
                if len(port_parts) == 3:
                    interface, mapping, port = port_parts
                elif len(port_parts) == 2:
                    interface = ''
                    mapping, port = port_parts
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
                volumes_from=volumes_from, privileged=privileged, name=name,
                hostname=hostname, **kwargs)
        except Exception, e:
            raise StandardError('There was an error starting the container: {}'.format(
                e.explanation))
        c_id = cnt.get('Id')
        c.start(c_id, binds=binds, port_bindings=port_bindings, links=links)
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
            container_id=container_id)
        apps = Application.objects.filter(containers__in=[container])
        for app in apps:
            app.update_config()

    def stop_container(self, container_id=None):
        c = Container.objects.get(container_id=container_id)
        if c.protected:
            raise ProtectedContainerError(
                _('Unable to stop container.  Container is protected.'))
        c = self._get_client()
        c.stop(container_id)
        self._invalidate_container_cache()

    def get_container_logs(self, container_id=None):
        c = self._get_client()
        return c.logs(container_id)

    def destroy_container(self, container_id=None):
        c = Container.objects.get(container_id=container_id)
        if c.protected:
            raise ProtectedContainerError(
                _('Unable to destroy container.  Container is protected.'))
        c = self._get_client()
        try:
            c.kill(container_id)
            c.remove_container(container_id)
        except client.APIError:
            # ignore 404s from api if container not found
            pass
        # remove metadata
        Container.objects.filter(container_id=container_id).delete()
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

    def get_hostname(self):
        # returns public_hostname if available otherwise default
        host = self.hostname
        if self.public_hostname:
            host = self.public_hostname
        return host

    def clone_container(self, container_id=None):
        c = Container.objects.get(container_id=container_id)
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

