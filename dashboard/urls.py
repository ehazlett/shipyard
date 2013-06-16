from django.conf.urls import patterns, url

urlpatterns = patterns('dashboard.views',
    url(r'^$', 'index', name='dashboard.index'),
    url(r'^hostinfo/$', '_host_info', name='dashboard.host_info'),
)
