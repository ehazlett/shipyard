from django.db import models
from django.db.models.signals import post_save, pre_delete
from django.contrib.auth.models import User
from containers.models import Container
from shipyard import utils, tasks

class Application(models.Model):
    name = models.CharField(max_length=64, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    domain_name = models.CharField(max_length=96, null=True, blank=True,
        unique=True)
    backend_port = models.CharField(max_length=5, null=True, blank=True)
    protocol = models.CharField(max_length=6, null=True, blank=True,
        default='http')
    containers = models.ManyToManyField(Container, null=True, blank=True)
    owner = models.ForeignKey(User, null=True, blank=True)

    def __unicode__(self):
        return self.name

def application_post_config(sender, **kwargs):
    app = kwargs.get('instance')
    args = (app.id,)
    utils.get_queue('shipyard').enqueue(tasks.update_hipache, args=args)

def remove_application_config(sender, **kwargs):
    app = kwargs.get('instance')
    args = (app.domain_name,)
    utils.get_queue('shipyard').enqueue(tasks.remove_hipache_config, args=args)

post_save.connect(application_post_config, sender=Application)
pre_delete.connect(remove_application_config, sender=Application)
