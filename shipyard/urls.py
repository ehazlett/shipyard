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
from django.conf.urls import patterns, include, url
from tastypie.api import Api
from django.contrib import admin
admin.autodiscover()

from containers.api import ContainerResource
from applications.api import ApplicationResource
from hosts.api import HostResource
from images.api import ImageResource

v1_api = Api(api_name='v1')
v1_api.register(ContainerResource())
v1_api.register(ApplicationResource())
v1_api.register(HostResource())
v1_api.register(ImageResource())

urlpatterns = patterns('',
    url(r'^$', 'shipyard.views.index', name='index'),
    url(r'^api/login', 'accounts.views.api_login', name='api_login'),
    url(r'^api/', include(v1_api.urls)),
    url(r'^agent/', include('agent.urls')),
    url(r'^accounts/', include('accounts.urls')),
    url(r'^applications/', include('applications.urls')),
    url(r'^containers/', include('containers.urls')),
    url(r'^images/', include('images.urls')),
    url(r'^hosts/', include('hosts.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
