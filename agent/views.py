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
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from hosts.models import Host
import json

@require_http_methods(['POST'])
@csrf_exempt
def register(request):
    form = request.POST
    name = form.get('name')
    h, created = Host.objects.get_or_create(name=name)
    if created:
        h.name = name
        h.hostname = request.META['REMOTE_ADDR']
        h.enabled = None
        h.save()
    data = {
        'key': h.agent_key,
    }
    resp = HttpResponse(json.dumps(data), content_type='application/json')
    return resp

