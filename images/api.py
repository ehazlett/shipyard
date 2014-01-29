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
from tastypie import fields
from tastypie.resources import ModelResource
from tastypie.bundle import Bundle
from tastypie.authorization import Authorization
from tastypie.authentication import (ApiKeyAuthentication,
    SessionAuthentication, MultiAuthentication)
from django.conf.urls import url
from images.models import Image
from hosts.api import HostResource

class ImageResource(ModelResource):
    host = fields.ToOneField(HostResource, 'host')
    history = fields.ListField(attribute='get_history')

    class Meta:
        queryset = Image.objects.exclude(repository__contains='none')
        resource_name = 'images'
        list_allowed_methods = ['get']
        detail_allowed_methods = ['get']
        authorization = Authorization()
        authentication = MultiAuthentication(
            ApiKeyAuthentication(), SessionAuthentication())

