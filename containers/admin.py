from django.contrib import admin
from containers.models import Host

class HostAdmin(admin.ModelAdmin):
    list_display = ('name', 'hostname', 'port', 'enabled')
    search_fields = ('name', 'hostname', 'port')
    list_filter = ('enabled',)

admin.site.register(Host, HostAdmin)
