from django.db import models
from docker import client
from django.conf import settings
from cache_utils.decorators import cached
from docker import client

HOST_CACHE_TTL = getattr(settings, 'HOST_CACHE_TTL', 15)

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
        self.get_containers.invalidate()
        self.get_containers.invalidate(show_all=True)

    def _invalidate_image_cache(self):
        # invalidate cache
        self.get_images.invalidate()
        self.get_images.invalidate(show_all=True)

    @cached(HOST_CACHE_TTL)
    def get_containers(self, show_all=False):
        c = client.Client(base_url='http://{0}:{1}'.format(self.hostname,
            self.port))
        return c.containers(all=show_all)

    @cached(HOST_CACHE_TTL)
    def get_images(self, show_all=False):
        c = client.Client(base_url='http://{0}:{1}'.format(self.hostname,
            self.port))
        return c.images(all=show_all)

    def create_container(self, image=None, command=None, ports=[]):
        c = self._get_client()
        cnt = c.create_container(image, command, detach=True, ports=ports)
        c.start(cnt.get('Id'))
        self._invalidate_container_cache()

    def destroy_container(self, container_id=None):
        c = self._get_client()
        c.remove_container(container_id)
        self._invalidate_container_cache()

    def import_image(self, repository=None):
        c = self._get_client()
        c.pull(repository)
        self._invalidate_image_cache()
