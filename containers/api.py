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
from tastypie import fields
from tastypie.resources import Resource
from tastypie.bundle import Bundle
from tastypie.authorization import Authorization
from tastypie.authentication import (ApiKeyAuthentication,
    SessionAuthentication, MultiAuthentication)
from containers.models import Container, Host
from hosts.api import HostResource
from django.contrib.auth.models import User
from shipyard import utils

def get_containers():
    valid_container_ids = [x.container_id for x in Host.get_all_containers()]
    return Container.objects.filter(container_id__in=valid_container_ids)

class ContainerResource(Resource):
    container_id = fields.CharField(attribute='container_id')
    description = fields.CharField(attribute='description')
    meta = fields.DictField(attribute='get_meta')
    is_running = fields.BooleanField(attribute='is_running')
    host = fields.ToOneField(HostResource, attribute='host')
    protected = fields.BooleanField(attribute='protected')

    class Meta:
        resource_name = 'containers'
        authorization = Authorization()
        authentication = MultiAuthentication(
            ApiKeyAuthentication(), SessionAuthentication())
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'delete']

    def detail_uri_kwargs(self, bundle_or_obj):
        kwargs = {}
        if isinstance(bundle_or_obj, Bundle):
            kwargs['pk'] = bundle_or_obj.obj.id
        else:
            kwargs['pk'] = bundle_or_obj.id
        return kwargs

    def get_object_list(self, request):
        containers = get_containers()
        return containers

    def obj_get_list(self, request=None, **kwargs):
        return self.get_object_list(request)

    def obj_get(self, request=None, **kwargs):
        # TODO: refactor Container to use a Manager to automatically
        # update container metadata
        id = kwargs.get('pk')
        c = Container.objects.get(id=id)
        # refresh metadata
        c.host._load_container_data(c.container_id)
        # re-run query to get new data
        c = Container.objects.get(id=id)
        return c

    def obj_create(self, bundle, request=None, **kwargs):
        """
        Override obj_create to launch containers and return metadata

        """
        # HACK: get host id -- this should probably be some type of
        # reverse lookup from tastypie
        host_urls = bundle.data.get('hosts')
        # remove 'hosts' from data and pass rest to create_container
        del bundle.data['hosts']
        # launch on hosts
        for host_url in host_urls:
            host_id = host_url.split('/')[-2]
            host = Host.objects.get(id=host_id)
            data = bundle.data
            c_id, status = host.create_container(**data)
            bundle.obj = Container.objects.get(
                container_id=utils.get_short_id(c_id))
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
