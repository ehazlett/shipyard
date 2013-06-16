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
from docker import client
from containers.models import Host

def create_container(image=None, command=None, ports=[], hosts=[]):
    '''
    Creates a container on one or more hosts

    '''
    c_ids = []
    for i in hosts:
        h = Host.objects.get(id=i)

        c_ids.append(cnt.get('Id'))
        # invalidate cache
        h.get_containers.invalidate()
    return c_ids

