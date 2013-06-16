from django.conf.urls import patterns, url

urlpatterns = patterns('containers.views',
    url(r'^addhost/$', 'add_host', name='containers.add_host'),
    url(r'^createcontainer/$', 'create_container',
        name='containers.create_container'),
    url(r'^destroycontainer/(?P<host>.*)/(?P<container_id>.*)/$',
        'destroy_container', name='containers.destroy_container'),
    url(r'^importimage/$', 'import_image',
        name='containers.import_image'),
)
