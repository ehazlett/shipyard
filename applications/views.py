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
from django.http import HttpResponse
from django.contrib import messages
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils.translation import ugettext as _
from django.contrib.auth.decorators import login_required
from applications.models import Application
from applications.forms import ApplicationForm, EditApplicationForm
from containers.models import Container

@login_required
def index(request):
    ctx = {
        'applications': Application.objects.filter(Q(owner=None) |
            Q(owner=request.user)),
        'form_application': ApplicationForm(),
    }
    return render_to_response('applications/index.html', ctx,
        context_instance=RequestContext(request))

@login_required
def create(request):
    form = ApplicationForm(request.POST)
    form.owner = request.user
    if form.is_valid():
        form.save()
    else:
        # report errors (just the text)
        for k,v in form.errors.iteritems():
            messages.add_message(request,
                messages.ERROR, v[0].capitalize())
    return redirect(reverse('applications.views.index'))

@login_required
#@owner_required # TODO
def details(request, app_uuid=None):
    app = Application.objects.get(uuid=app_uuid)
    attached_container_ids = [x.container_id for x in app.containers.all()]
    initial = {
        'name': app.name,
        'description': app.description,
        'domain_name': app.domain_name,
        'backend_port': app.backend_port,
        'protocol': app.protocol,
    }
    ctx = {
        'application': app,
        'form_edit_application': EditApplicationForm(initial=initial),
        'containers': Container.objects.filter(Q(owner=None) |
            Q(owner=request.user)).exclude(container_id__in=attached_container_ids),
    }
    return render_to_response('applications/details.html', ctx,
        context_instance=RequestContext(request))

@login_required
#@owner_required # TODO
def edit(request):
    data = request.POST
    app_uuid = data.get('uuid')
    app = Application.objects.get(uuid=app_uuid)
    app.name = data.get('name')
    app.description = data.get('description')
    app.domain_name = data.get('domain_name')
    app.backend_port = data.get('backend_port')
    app.protocol = data.get('protocol')
    app.save()
    return redirect(reverse('applications.views.details',
        kwargs={'app_uuid': app_uuid}))

@login_required
#@owner_required # TODO
def delete(request, app_uuid=None):
    app = Application.objects.get(uuid=app_uuid)
    app.delete()
    return redirect(reverse('applications.views.index'))

@login_required
#@owner_required # TODO
def attach_containers(request, app_uuid=None):
    app = Application.objects.get(uuid=app_uuid)
    data = request.POST
    container_ids = data.getlist('containers', [])
    if container_ids:
        for i in container_ids:
            c = Container.objects.get(container_id=i)
            app.containers.add(c)
        app.save()
    return redirect(reverse('applications.views.details',
        kwargs={'app_uuid': app_uuid}))

@login_required
#@owner_required # TODO
def remove_container(request, app_uuid=None, container_id=None):
    app = Application.objects.get(uuid=app_uuid)
    c = Container.objects.get(container_id=container_id)
    app.containers.remove(c)
    app.save()
    return redirect(reverse('applications.views.details',
        kwargs={'app_uuid': app_uuid}))
