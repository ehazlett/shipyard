from django.shortcuts import render_to_response, redirect
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.http import HttpResponse

def index(request):
    if not request.user.is_authenticated():
        return redirect(reverse('accounts.views.login'))
    else:
        return redirect(reverse('dashboard.views.index'))
