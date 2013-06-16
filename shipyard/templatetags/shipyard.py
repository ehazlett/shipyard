from django import template
from django.template.defaultfilters import stringfilter

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

