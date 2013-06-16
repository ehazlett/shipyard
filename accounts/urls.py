from django.conf.urls import patterns, url

urlpatterns = patterns('accounts.views',
    url(r'^login/$', 'login', name='accounts.login'),
    url(r'^logout/$', 'logout', name='accounts.logout'),
)
