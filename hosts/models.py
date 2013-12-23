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
from shipyard.exceptions import ProtectedContainerError
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

    def _load_container_data(self, container_id):
        c = self._get_client()
        meta = c.inspect_container(container_id)
        m, created = Container.objects.get_or_create(
            container_id=container_id, host=self)
        m.is_running = meta.get('State', {}).get('Running', False)
        m.meta = json.dumps(meta)
        m.save()

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
                volumes_from=volumes_from, name=name,
                hostname=hostname, **kwargs)
        except Exception, e:
            raise StandardError('There was an error starting the container: {}'.format(
                e))
        c_id = cnt.get('Id')
        c.start(c_id, binds=binds, port_bindings=port_bindings, links=links,
                privileged=privileged)
        status = False
        # create metadata only if container starts successfully
        if c.inspect_container(c_id).get('State', {}).get('Running'):
            c, created = Container.objects.get_or_create(container_id=c_id,
                host=self)
            c.description = description
            c.owner = owner
            c.save()
            status = True
        return c_id, status

    def restart_container(self, container_id=None):
        from applications.models import Application
        c = self._get_client()
        c.restart(container_id)
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

    def import_image(self, repository=None):
        c = self._get_client()
        c.pull(repository)

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
        port_specs = cfg.get('ExposedPorts', {}).keys()
        ports = []
        for p in port_specs:
            ports.append(p.split('/')[0])
        env = cfg.get('Env')
        mem = cfg.get('Memory')
        hostname = cfg.get('Hostname')
        description = c.description
        volumes = cfg.get('Volumes')
        volumes_from = cfg.get('VolumesFrom')
        privileged = cfg.get('Privileged')
        owner = c.owner
        c_id, status = self.create_container(image, command, ports,
            env, mem, description, volumes, volumes_from, privileged, 
            owner=owner, hostname=hostname)
        # mark as protected if needed
        if c.protected:
            container = Container.objects.get(container_id=c_id)
            container.protected = True
            container.save()
        return c_id, status

