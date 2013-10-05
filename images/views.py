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
from django.template import RequestContext
from django.contrib import messages
from django.utils.translation import ugettext as _
from containers.models import Host
from shipyard import tasks

@login_required
def index(request):
    hosts = Host.objects.filter(enabled=True)
    images = {}
    for h in hosts:
        img = h.get_images()
        if img:
            images[h] = img
    ctx = {
        'images': images
    }
    return render_to_response('images/index.html', ctx,
        context_instance=RequestContext(request))

@login_required
def remove_image(request, host_id, image_id):
    h = Host.objects.get(id=host_id)
    h.remove_image(image_id)
    messages.add_message(request, messages.INFO, _('Removed') + ' {}'.format(
        image_id))
    return redirect('images.views.index')

@login_required
def refresh(request):
    '''
    Invalidates host cache and redirects to images view

    '''
    for h in Host.objects.filter(enabled=True):
        h._invalidate_image_cache()
    return redirect('images.views.index')

@login_required
def import_image(request):
    repo = request.POST.get('repo_name')
    if repo:
        tasks.import_image.delay(repo)
        messages.add_message(request, messages.INFO, _('Importing') + \
            ' {}'.format(repo) + _('.  This could take a few minutes.'))
    return redirect('images.views.index')

@login_required
def build_image(request):
    path = request.POST.get('path')
    tag = request.POST.get('tag', None)
    if path:
        tasks.build_image.delay(path, tag)
        messages.add_message(request, messages.INFO, _('Building.  This ' \
            'could take a few minutes.'))
    return redirect('images.views.index')
