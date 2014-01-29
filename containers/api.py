# Copyright Evan Hazlett and contributors.
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
from django.http import Http404, HttpResponse
from tastypie import fields
from tastypie.resources import ModelResource
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.bundle import Bundle
from tastypie.authorization import Authorization
from tastypie.authentication import (ApiKeyAuthentication,
    SessionAuthentication, MultiAuthentication)
from django.conf.urls import url
from tastypie.utils import trailing_slash
from containers.models import Container
from hosts.models import Host
from django.contrib.auth.models import User
from shipyard import utils
import time
import socket

class ContainerResource(ModelResource):
    meta = fields.DictField(attribute='get_meta')

    class Meta:
        queryset = Container.objects.all()
        resource_name = 'containers'
        authorization = Authorization()
        authentication = MultiAuthentication(
            ApiKeyAuthentication(), SessionAuthentication())
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'delete']
        filtering = {
            'container_id': ALL,
            'is_running': ALL,
        }

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/restart%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('restart'), name="api_restart"),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/stop%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('stop'), name="api_stop"),
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/destroy%s$" % (self._meta.resource_name, trailing_slash()), self.wrap_view('destroy'), name="api_destroy"),
        ]
    
    def _container_action(self, action, request, **kwargs):
        """
        Container actions

        :param action: Action to perform (restart, stop, destroy)
        :param request: Request object

        """
        self.method_check(request, allowed=['get'])
        self.is_authenticated(request)
        self.throttle_check(request)

        c_id = kwargs.get('pk')
        if not c_id:
            return HttpResponse(status=404)
        try:
            container = Container.objects.get(id=c_id)
        except Container.DoesNotExist:
            return HttpResponse(status=404)
        actions = {
            'restart': container.restart,
            'stop': container.stop,
            'destroy': container.destroy,
            }
        actions[action]()
        self.log_throttled_access(request)
        return HttpResponse(status=204)
        
    def restart(self, request, **kwargs):
        """
        Custom view for restarting containers

        """
        return self._container_action('restart', request, **kwargs)

    def stop(self, request, **kwargs):
        """
        Custom view for stopping containers

        """
        return self._container_action('stop', request, **kwargs)

    def destroy(self, request, **kwargs):
        """
        Custom view for destroying containers

        """
        return self._container_action('destroy', request, **kwargs)

    def detail_uri_kwargs(self, bundle_or_obj, **kwargs):
        kwargs = {}
        if isinstance(bundle_or_obj, Bundle):
            kwargs['pk'] = bundle_or_obj.obj.id
        else:
            kwargs['pk'] = bundle_or_obj.id
        return kwargs

    def obj_create(self, bundle, request=None, **kwargs):
        """
        Override obj_create to launch containers and return metadata

        """
        # HACK: get host id -- this should probably be some type of
        # reverse lookup from tastypie
        if not bundle.data.has_key('hosts'):
            raise StandardError('You must specify hosts')
        host_urls = bundle.data.get('hosts')
        # remove 'hosts' from data and pass rest to create_container
        del bundle.data['hosts']
        containers = []
        # launch on hosts
        for host_url in host_urls:
            host_id = host_url.split('/')[-2]
            host = Host.objects.get(id=host_id)
            data = bundle.data
            c_id, status = host.create_container(**data)
            obj = Container.objects.get(container_id=c_id)
            bundle.obj = obj
            containers.append(obj)
        # wait for containers if port is specified and requested
        if bundle.request.GET.has_key('wait') == True:
            # check for timeout override
            try:
                timeout = int(bundle.request.GET.get('wait'))
            except Exception, e:
                timeout = 60
            for c in containers:
                # wait for port to be available
                count = 0
                c_id = c.container_id
                while True:
                    if count > timeout:
                        break
                    # reload meta to get NAT port
                    c = Container.objects.get(container_id=c_id)
                    if c.is_available():
                        break
                    count += 1
                    time.sleep(1)
        bundle = self.full_hydrate(bundle)
        return bundle

    def obj_delete(self, request=None, **kwargs):
        id = kwargs.get('pk')
        c = Container.objects.get(id=id)
        h = c.host
        h.destroy_container(c.container_id)

    def obj_delete_list(self, request=None, **kwargs):
        for c in Container.objects.all():
            h = c.host
            h.destroy_container(c.container_id)
