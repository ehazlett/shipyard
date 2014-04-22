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
from django.contrib import admin
from containers.models import Container

class ContainerAdmin(admin.ModelAdmin):
    list_display = ('container_id', 'host', 'owner')
    list_display_filter = ('is_running',)
    search_fields = ('container_id', 'host__hostname')

admin.site.register(Container, ContainerAdmin)
