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
from hosts.models import Host

class Image(models.Model):
    image_id = models.CharField(max_length=96, null=True, blank=True)
    repository = models.CharField(max_length=96)
    host = models.ForeignKey(Host, null=True)
    meta = models.TextField(blank=True, null=True, default='{}')

    def __unicode__(self):
        return "{} ({})".format(self.repository, self.image_id[:12])
