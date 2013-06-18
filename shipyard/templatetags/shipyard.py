from django import template
from django.template.defaultfilters import stringfilter
from containers.models import Host

register = template.Library()

@register.filter
@stringfilter
def container_status(value):
    """
    Returns container status as a bootstrap class

    """
    cls = ''
    if value.find('Up') > -1:
        cls = 'success'
    elif value.find('Exit 0') > -1:
        cls = 'info'
    else:
        cls = 'important'
    return cls

@register.filter
@stringfilter
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
        all_forwards = value.split(',')
        print(all_forwards)
        for x in all_forwards:
            k,v = x.split('->')
            ports[k] = v
        for k,v in ports.items():
            link = '<a href="http://{0}:{1}" target="_blank">{1}->{2}</a>'.format(
                host.hostname, k,v)
            links.append(link)
        ret = ', '.join(links)
    return ret
