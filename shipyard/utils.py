from docker import client
from containers.models import Host

def create_container(image=None, command=None, ports=[], hosts=[]):
    '''
    Creates a container on one or more hosts

    '''
    c_ids = []
    for i in hosts:
        h = Host.objects.get(id=i)

        c_ids.append(cnt.get('Id'))
        # invalidate cache
        h.get_containers.invalidate()
    return c_ids

