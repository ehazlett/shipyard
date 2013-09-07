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
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.template import RequestContext
from django.contrib import messages
from django.utils.translation import ugettext as _
from containers.models import Host

@login_required
def index(request):
    hosts = Host.objects.all()
    ctx = {
        'hosts': hosts
    }
    return render_to_response('hosts/index.html', ctx,
        context_instance=RequestContext(request))

@require_http_methods(['POST'])
@login_required
def add_host(request):
    form = HostForm(request.POST)
    try:
        host = form.save()
        messages.add_message(request, messages.INFO, _('Added ') + host.name)
    except Exception, e:
        msg = strip_tags('.'.join([x[1][0] for x in form.errors.items()]))
        messages.add_message(request, messages.ERROR, msg)
    return redirect('hosts.views.index')

@login_required
def remove_host(request, host_id):
    h = Host.objects.get(id=host_id)
    h.delete()
    messages.add_message(request, messages.INFO, _('Removed') + ' {0}'.format(
        h.name))
    return redirect('hosts.views.index')

