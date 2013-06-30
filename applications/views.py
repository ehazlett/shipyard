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
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from applications.models import Application

@login_required
def index(request):
    ctx = {
        'applications': Application.objects.filter(Q(owner=None) |
            Q(owner=request.user))
    }
    return render_to_response('applications/index.html', ctx,
        context_instance=RequestContext(request))

