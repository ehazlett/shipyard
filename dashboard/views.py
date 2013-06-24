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
from django.shortcuts import render_to_response, redirect
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.db.models import Q
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from containers.models import Host, Container
from containers.forms import (HostForm, CreateContainerForm,
    ImportRepositoryForm, ImageBuildForm)

@login_required
def index(request):
    ctx = {
        'form_add_host': HostForm(),
        'form_create_container': CreateContainerForm(),
        'form_import_repository': ImportRepositoryForm(),
        'form_build_image': ImageBuildForm(),
    }
    return render_to_response('dashboard/index.html', ctx,
        context_instance=RequestContext(request))

@login_required
def _host_info(request):
    hosts = Host.objects.filter(enabled=True)
    # load containers
    [h.get_containers() for h in hosts]
    # return metadata objects
    containers = Container.objects.filter(host__in=hosts).filter(
        Q(user=None) | Q(user=request.user))
    ctx = {
        'hosts': hosts,
        'containers': containers,
    }
    return render_to_response('dashboard/_host_info.html', ctx,
        context_instance=RequestContext(request))
