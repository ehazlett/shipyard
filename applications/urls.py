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
from django.conf.urls import patterns, url

urlpatterns = patterns('applications.views',
    url(r'^$', 'index', name='applications.index'),
    url(r'^create/$', 'create', name='applications.create'),
    url(r'^details/(?P<app_uuid>\w{32})/$', 'details',
        name='applications.details'),
    url(r'^edit/$', 'edit', name='applications.edit'),
    url(r'^(?P<app_uuid>\w{32})/delete/$', 'delete',
        name='applications.delete'),
    url(r'^(?P<app_uuid>\w{32})/containers/attach/$',
        'attach_containers', name='applications.attach_containers'),
    url(r'^(?P<app_uuid>\w{32})/containers/(?P<container_id>\w{12})/remove/$',
        'remove_container', name='applications.remove_container'),
)
