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
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from django.db.models import Q
from shipyard import utils
import json

class Container(models.Model):
    container_id = models.CharField(max_length=96, null=True, blank=True)
    description = models.TextField(blank=True, null=True, default='')
    meta = models.TextField(blank=True, null=True, default='{}')
    is_running = models.BooleanField(default=True)
    host = models.ForeignKey('hosts.Host', null=True, blank=True)
    owner = models.ForeignKey(User, null=True, blank=True)
    protected = models.BooleanField(default=False)

    def __unicode__(self):
        d = self.get_short_id()
        if d and self.description:
            d += ' ({0})'.format(self.description)
        return d

    @classmethod
    def get_running(cls, user=None):
        from hosts.models import Host
        hosts = Host.objects.filter(enabled=True)
        containers = Container.objects.filter(is_running=True,
                host__in=hosts)
        return containers

    def is_public(self):
        if self.owner == None:
            return True
        else:
            return False

    def get_meta(self):
        meta = {}
        if self.meta:
            meta = json.loads(self.meta)
        return meta

    def get_short_id(self):
        return self.container_id[:12]

    def get_applications(self):
        from applications.models import Application
        return Application.objects.filter(containers__in=[self])

    def is_available(self):
        """
        This will run through all ExposedPorts and attempt a connect.  If
        successful, returns True.  If there are no ExposedPorts, it is assumed
        that the container has completed and is available.

        """
        meta = self.get_meta()
        exposed_ports = meta.get('Config', {}).get('ExposedPorts', [])
        available = True
        port_checks = []
        host = self.host.get_hostname()
        # attempt to connect to check availability
        meta_net = meta.get('NetworkSettings')
        if meta_net.get('Ports') and len(meta_net.get('Ports')) != 0:
            for e_port in exposed_ports:
                ports = meta_net.get('Ports')
                port_defs = ports[e_port]
                if port_defs:
                    port = port_defs[0].get('HostPort')
                    try:
                        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        s.settimeout(1)
                        s.connect((host, int(port)))
                        port_checks.append(True)
                        continue
                    except Exception, e:
                        port_checks.append(False)
                        s.close()
            if port_checks and False in port_checks:
                available = False
        return available

    def restart(self):
        return self.host.restart_container(container_id=self.container_id)

    def stop(self):
        return self.host.stop_container(container_id=self.container_id)

    def logs(self):
        return self.host.get_container_logs(container_id=self.container_id)

    def destroy(self):
        return self.host.destroy_container(container_id=self.container_id)

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
            for port_proto, host_list in network_settings.get('Ports', {}).items():
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
        d = self.get_short_id()
        if self.description:
            d = self.description
        return d
