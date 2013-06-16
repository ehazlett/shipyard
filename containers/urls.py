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

urlpatterns = patterns('containers.views',
    url(r'^addhost/$', 'add_host', name='containers.add_host'),
    url(r'^createcontainer/$', 'create_container',
        name='containers.create_container'),
    url(r'^destroycontainer/(?P<host>.*)/(?P<container_id>.*)/$',
        'destroy_container', name='containers.destroy_container'),
    url(r'^importimage/$', 'import_image',
        name='containers.import_image'),
)
