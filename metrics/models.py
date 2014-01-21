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

class Metric(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    metric_type = models.CharField(max_length=96, null=True, blank=True)
    source = models.CharField(max_length=96, null=True, blank=True)
    counter = models.CharField(max_length=96, null=True, blank=True)
    value = models.IntegerField(null=True, blank=True)
    unit = models.CharField(max_length=64, null=True, blank=True)

    def __unicode__(self):
        return '{}: {} {} {}'.format(self.metric_type, self.counter, self.value,
                self.unit)
