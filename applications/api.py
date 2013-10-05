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
from tastypie.resources import ModelResource
from tastypie.bundle import Bundle
from django.conf.urls import url
from applications.models import Application
from containers.api import ContainerResource

class ApplicationResource(ModelResource):
    containers = fields.ToManyField(ContainerResource, 'containers')

    class Meta:
        queryset = Application.objects.all()
        resource_name = 'application'
        detail_uri_name = 'uuid'
        excludes = ['id',]

    def prepend_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<uuid>[\w\d_.-]+)/$" % self._meta.resource_name, self.wrap_view('dispatch_detail'), name="api_dispatch_detail"),
        ]
