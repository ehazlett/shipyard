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
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils.translation import ugettext as _
from django.contrib import messages
import django_rq
from containers.models import Host
from containers.forms import HostForm, CreateContainerForm, ImportImageForm
from shipyard import utils

@require_http_methods(['POST'])
@login_required
def add_host(request):
    form = HostForm(request.POST)
    host = form.save()
    messages.add_message(request, messages.INFO, _('Added ') + host.name)
    return redirect('dashboard.views.index')

@require_http_methods(['POST'])
@login_required
def create_container(request):
    form = CreateContainerForm(request.POST)
    # TODO: create / start container
    image = form.data.get('image')
    command = form.data.get('command')
    if command.strip() == '':
        command = None
    ports = form.data.get('ports', '').split()
    hosts = form.data.getlist('hosts')
    for i in hosts:
        host = Host.objects.get(id=i)
        host.create_container(image, command, ports)
    messages.add_message(request, messages.INFO, _('Created') + ' {0}'.format(
        image))
    return redirect('dashboard.views.index')

@login_required
def restart_container(request, host, container_id):
    h = Host.objects.get(name=host)
    h.restart_container(container_id)
    messages.add_message(request, messages.INFO, _('Restarted') + ' {0}'.format(
        container_id))
    return redirect('dashboard.views.index')

@login_required
def stop_container(request, host, container_id):
    h = Host.objects.get(name=host)
    h.stop_container(container_id)
    messages.add_message(request, messages.INFO, _('Stopped') + ' {0}'.format(
        container_id))
    return redirect('dashboard.views.index')

@login_required
def destroy_container(request, host, container_id):
    h = Host.objects.get(name=host)
    h.destroy_container(container_id)
    messages.add_message(request, messages.INFO, _('Removed') + ' {0}'.format(
        container_id))
    return redirect('dashboard.views.index')

@require_http_methods(['POST'])
@login_required
def import_image(request):
    form = ImportImageForm(request.POST)
    hosts = form.data.getlist('hosts')
    for i in hosts:
        host = Host.objects.get(id=i)
        django_rq.enqueue(host.import_image, form.data.get('repository'))
    messages.add_message(request, messages.INFO, _('Importing') + ' {0}'.format(
        form.data.get('repository')) + '. ' + _('This may take a few minutes.'))
    return redirect('dashboard.views.index')

@login_required
def refresh(request):
    '''
    Invalidates host cache and redirects to dashboard

    '''
    for h in Host.objects.filter(enabled=True):
        h.invalidate_cache()
    return redirect('dashboard.views.index')

