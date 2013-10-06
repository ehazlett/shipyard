from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from optparse import make_option

class Command(BaseCommand):
    help = 'Creates missing API keys for users'

    def handle(self, *args, **options):
        from tastypie.models import ApiKey
        users = User.objects.all()
        for user in users:
            try:
                key = user.api_key
            except ApiKey.DoesNotExist:
                print('Creating API key for {}'.format(user.username))
                k = ApiKey()
                k.user = user
                k.save()
