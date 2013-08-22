from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from optparse import make_option

class Command(BaseCommand):
    help = 'Creates/Updates an Admin user'
    option_list = BaseCommand.option_list + (
        make_option('--username',
            action='store',
            dest='username',
            default=None,
            help='Admin username'),
        ) + (
        make_option('--password',
            action='store',
            dest='password',
            default=None,
            help='Admin password'),
        )

    def handle(self, *args, **options):
        username = options.get('username')
        password = options.get('password')
        if not username or not password:
            raise StandardError('You must specify a username and password')
        user, created = User.objects.get_or_create(username=username)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print('{0} updated'.format(username))
