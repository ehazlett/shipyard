from django.core.management.base import BaseCommand, CommandError
from containers import models

class Command(BaseCommand):
    help = 'Clears container metadata'

    def handle(self, *args, **options):
        models.Container.objects.all().delete()
