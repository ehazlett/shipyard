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
from docker import client
from django.conf import settings
from docker import client
from django.core.cache import cache

HOST_CACHE_TTL = getattr(settings, 'HOST_CACHE_TTL', 15)
CONTAINER_KEY = '{0}:containers'
IMAGE_KEY = '{0}:images'

class Host(models.Model):
    name = models.CharField(max_length=64, null=True, blank=True,
        unique=True)
    hostname = models.CharField(max_length=128, null=True, blank=True,
        unique=True)
    port = models.SmallIntegerField(null=True, blank=True, default=4243)
    enabled = models.NullBooleanField(null=True, default=True)

    def __unicode__(self):
        return self.name

    def _get_client(self):
        url ='{0}:{1}'.format(self.hostname, self.port)
        if not url.startswith('http'):
            url = 'http://{0}'.format(url)
        return client.Client(url)

    def _invalidate_container_cache(self):
        # invalidate cache
        cache.delete(CONTAINER_KEY.format(self.name))

    def _invalidate_image_cache(self):
        # invalidate cache
        cache.delete(IMAGE_KEY.format(self.name))

    def invalidate_cache(self):
        self._invalidate_container_cache()
        self._invalidate_image_cache()

    def get_containers(self, show_all=False):
        c = client.Client(base_url='http://{0}:{1}'.format(self.hostname,
            self.port))
        key = CONTAINER_KEY.format(self.name)
        containers = cache.get(key)
        if containers is None:
            containers = c.containers(all=show_all)
            cache.set(key, containers, HOST_CACHE_TTL)
        return containers

    def get_images(self, show_all=False):
        c = client.Client(base_url='http://{0}:{1}'.format(self.hostname,
            self.port))
        key = IMAGE_KEY.format(self.name)
        images = cache.get(key)
        if images is None:
            images = c.images(all=show_all)
            cache.set(key, images, HOST_CACHE_TTL)
        return images

    def create_container(self, image=None, command=None, ports=[],
        environment=[]):
        c = self._get_client()
        cnt = c.create_container(image, command, detach=True, ports=ports,
            environment=environment)
        c.start(cnt.get('Id'))
        self._invalidate_container_cache()

    def restart_container(self, container_id=None):
        c = self._get_client()
        c.restart(container_id)
        self._invalidate_container_cache()

    def stop_container(self, container_id=None):
        c = self._get_client()
        c.stop(container_id)
        self._invalidate_container_cache()

    def destroy_container(self, container_id=None):
        c = self._get_client()
        c.remove_container(container_id)
        self._invalidate_container_cache()

    def import_image(self, repository=None):
        c = self._get_client()
        c.pull(repository)
        self._invalidate_image_cache()
