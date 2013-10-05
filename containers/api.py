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
from containers.models import Container, Host

class ContainerResource(Resource):
    container_id = fields.CharField(attribute='container_id')
    name = fields.CharField(attribute='get_name')
    applications = fields.ListField(attribute='get_applications')
    meta = fields.DictField(attribute='get_meta')
    ports = fields.DictField(attribute='get_ports')
    is_running = fields.BooleanField(attribute='is_running')
    is_public = fields.BooleanField(attribute='is_public')

    class Meta:
        resource_name = 'container'

    def detail_uri_kwargs(self, bundle_or_obj):
        kwargs = {}

        if isinstance(bundle_or_obj, Bundle):
            kwargs['pk'] = bundle_or_obj.obj.container_id
        else:
            kwargs['pk'] = bundle_or_obj.container_id
        return kwargs

    def get_obj_list(self, request, **kwargs):
        user = None
        show_all = False
        if request:
            show_all = True if request.GET.has_key('showall') else False
            user = request.user
        containers = Host.get_all_containers(show_all=show_all, owner=user)
        print(dir(containers[0]))
        return containers

    def obj_get_list(self, request=None, **kwargs):
        return self.get_obj_list(request)

    def obj_get(self, request=None, **kwargs):
        return Container.objects.get(container_id=kwargs['pk'])
