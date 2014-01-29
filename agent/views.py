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
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from functools import wraps
from hosts.models import Host
from containers.models import Container
from images.models import Image
import json

def http_401(msg):
    return HttpResponse(msg, status=401)

def get_agent_key(request):
    auth = request.META.get('HTTP_AUTHORIZATION')
    if not auth:
        return None
    key = auth.split(':')[-1]
    return key

def agent_key_required(func):
    """
    Decorator to check for valid agent key

    Expects to have an authorization header in the following format:

        Authorization AgentKey:<key>

    """
    def f(request, *args, **kwargs):
        key = get_agent_key(request)
        try:
            host = Host.objects.get(agent_key=key)
        except Host.DoesNotExist:
            return http_401('unauthorized')
        return func(request, *args, **kwargs)
    return f

@require_http_methods(['POST'])
@csrf_exempt
def register(request):
    form = request.POST
    name = form.get('name')
    port = form.get('port')
    hostname = form.get('hostname')
    h, created = Host.objects.get_or_create(name=name)
    if created:
        h.name = name
        h.hostname = hostname
        h.enabled = None
        h.port = int(port)
        h.save()
    data = {
        'key': h.agent_key,
    }
    resp = HttpResponse(json.dumps(data), content_type='application/json')
    return resp

@csrf_exempt
@agent_key_required
def containers(request):
    key = get_agent_key(request)
    host = Host.objects.get(agent_key=key)
    host.save() # update last_updated
    if not host.enabled:
        return HttpResponse(status=403)
    container_data = json.loads(request.body)
    for d in container_data:
        c = d.get('Container')
        meta = d.get('Meta')
        container, created = Container.objects.get_or_create(host=host,
                container_id=c.get('Id'))
        container.meta = json.dumps(meta)
        container.is_running = meta.get('State', {}).get('Running')
        container.save()
    container_ids = [x.get('Container').get('Id') for x in container_data]
    # cleanup old containers
    Container.objects.filter(host=host).exclude(protected=True).exclude(
            container_id__in=container_ids).delete()
    return HttpResponse()

@csrf_exempt
@agent_key_required
def images(request):
    key = get_agent_key(request)
    host = Host.objects.get(agent_key=key)
    host.save() # update last_updated
    if not host.enabled:
        return HttpResponse(status=403)
    image_data = json.loads(request.body)
    for i in image_data:
        image, created = Image.objects.get_or_create(host=host,
                image_id=i.get('Id'))
        image.repository = i.get('RepoTags')[0]
        image.history = json.dumps(image_data)
        image.save()
    # cleanup old images
    image_ids = [x.get('Id') for x in image_data]
    Image.objects.filter(host=host).exclude(image_id__in=image_ids).delete()
    return HttpResponse()
