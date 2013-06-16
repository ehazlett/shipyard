# Copyright 2013 Evan Hazlett and contributors
#
from django.shortcuts import render_to_response, redirect
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from containers.models import Host
from containers.forms import HostForm, CreateContainerForm, ImportImageForm

@login_required
def index(request):
    ctx = {
        'form_add_host': HostForm(),
        'form_create_container': CreateContainerForm(),
        'form_import_image': ImportImageForm(),
    }
    return render_to_response('dashboard/index.html', ctx,
        context_instance=RequestContext(request))

@login_required
def _host_info(request):
    containers = {}
    images = {}
    hosts = Host.objects.all()
    for h in hosts:
        containers[h] = h.get_containers(show_all=True)
        images[h] = h.get_images()
    ctx = {
        'containers': containers,
        'images': images,
        'hosts': Host.objects.all(),
    }
    return render_to_response('dashboard/_host_info.html', ctx,
        context_instance=RequestContext(request))
