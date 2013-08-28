from django import template
from django.template.defaultfilters import stringfilter
from django.utils.translation import ugettext as _
from containers.models import Host
from datetime import datetime

register = template.Library()

@register.filter
def container_status(value):
    """
    Returns container status as a bootstrap class

    """
    cls = ''
    if value:
        if value.get('Running'):
            cls = 'success'
        elif value.get('ExitCode') == 0:
            cls = 'info'
        else:
            cls = 'important'
    return cls

@register.filter
def container_uptime(value):
    """
    Returns container uptime from date stamp

    """
    if value:
        try:
            tz = value.split('.')[-1]
            ts = datetime.strptime(value, '%Y-%m-%dT%H:%M:%S.' + tz)
            return datetime.utcnow().replace(microsecond=0) - ts
        except:
            return ''
    return value

@register.filter
def container_port_links(value, host):
    """
    Returns container ports as links

    :param host: Container host name

    """
    links = []
    ports = {}
    ret = ""
    if value:
        host = Host.objects.get(name=host)
        if value.has_key('Tcp'):
            value = value.get('Tcp')
        for k,v in value.items():
            link = '<a href="http://{0}:{2}" target="_blank">{1} -> {2}</a>'.format(
                host.hostname, k.strip(), v.strip())
            links.append(link)
        ret = ', '.join(links)
    return ret

@register.filter
@stringfilter
def container_memory_to_mb(value):
    """
    Returns container memory as MB

    """
    if value.strip() and int(value) != 0:
        return '{0} MB'.format(int(value) / 1048576)
    else:
        return _('unlimited')

@register.filter()
def split(value, arg):
    return value.split(arg)
