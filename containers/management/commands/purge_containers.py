from django.core.management.base import BaseCommand, CommandError
from containers.models import Host, Container
from shipyard import utils

class Command(BaseCommand):
    help = 'Purges container metadata for removed containers'

    def handle(self, *args, **options):
        hosts = Host.objects.filter(enabled=True)
        all_containers = [x.container_id for x in Container.objects.all()]
        for host in hosts:
            host_containers = [utils.get_short_id(c.get('Id')) \
                for c in host.get_containers(show_all=True)]
            for c in all_containers:
                if c not in host_containers:
                    print('Removing {}'.format(c))
                    Container.objects.get(container_id=c).delete()

