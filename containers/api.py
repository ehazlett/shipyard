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
from tastypie.resources import Resource, ModelResource
from tastypie.bundle import Bundle
from tastypie.authorization import Authorization
from tastypie.authentication import ApiKeyAuthentication
from containers.models import Container, Host
from shipyard import utils

class ContainerResource(ModelResource):
    meta = fields.DictField(attribute='get_meta')

    class Meta:
        valid_container_ids = [x.container_id for x in Host.get_all_containers()]
        queryset = Container.objects.filter(container_id__in=valid_container_ids)
        resource_name = 'containers'
        authorization = Authorization()
        authentication = ApiKeyAuthentication()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'delete']

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
