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
        form.data.get('repository')) + '. ' + _('This may take a few minutes...'))
    return redirect('dashboard.views.index')
