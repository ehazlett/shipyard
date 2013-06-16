from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.ForeignKey(User, null=True, unique=True)

    def __unicode__(self):
        return self.user.username

def create_profile(sender, **kwargs):
    user = kwargs.get('instance')
    if kwargs.get('created'):
        profile = UserProfile(user=user)
        profile.save()

post_save.connect(create_profile, sender=User)
