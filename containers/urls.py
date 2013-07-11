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
    url(r'^refresh/$', 'refresh', name='containers.refresh'),
    url(r'^searchrepository/$', 'search_repository',
        name='containers.search_repository'),
    url(r'^createcontainer/$', 'create_container',
        name='containers.create_container'),
    url(r'^destroycontainer/(?P<host>.*)/(?P<container_id>.*)/$',
        'destroy_container', name='containers.destroy_container'),
    url(r'^attachcontainer/(?P<host>.*)/(?P<container_id>.*)/$',
        'attach_container', name='containers.attach_container'),
    url(r'^restartcontainer/(?P<host>.*)/(?P<container_id>.*)/$',
        'restart_container', name='containers.restart_container'),
    url(r'^stopcontainer/(?P<host>.*)/(?P<container_id>.*)/$',
        'stop_container', name='containers.stop_container'),
    url(r'^containerinfo/$',
        'container_info', name='containers.container_info'),
    url(r'^containerinfo/(?P<container_id>.*)/$',
        'container_info', name='containers.container_info'),
    url(r'^importimage/$', 'import_image',
        name='containers.import_image'),
    url(r'^buildimage/$', 'build_image',
        name='containers.build_image'),
)
