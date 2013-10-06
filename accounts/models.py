# Copyright 2013 Evan Hazlett and contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from tastypie.models import create_api_key

class UserProfile(models.Model):
    user = models.ForeignKey(User, null=True, unique=True)

    def __unicode__(self):
        return self.user.username

def create_profile(sender, **kwargs):
    user = kwargs.get('instance')
    if kwargs.get('created'):
        profile = UserProfile(user=user)
        profile.save()

# profile creation
post_save.connect(create_profile, sender=User)
# api key creation
post_save.connect(create_api_key, sender=User)
