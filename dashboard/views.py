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
from shipyard import utils

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
    show_all = True if request.GET.has_key('showall') else False
    containers = None
    # load containers
    if hosts:
        c_ids = []
        for h in hosts:
            for c in h.get_containers(show_all=show_all):
                c_ids.append(utils.get_short_id(c.get('Id')))
        # return metadata objects
        containers = Container.objects.filter(container_id__in=c_ids).filter(
            Q(owner=None) | Q(owner=request.user))
    print(containers)
    ctx = {
        'hosts': hosts,
        'containers': containers,
        'show_all': show_all,
    }
    return render_to_response('dashboard/_host_info.html', ctx,
        context_instance=RequestContext(request))
