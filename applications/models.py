from django.db import models
from django.db.models.signals import post_save, pre_delete, m2m_changed
from django.contrib.auth.models import User
from containers.models import Container
from shipyard import utils, tasks
from django.utils.translation import ugettext as _
import uuid

PROTOCOL_CHOICES = (
    ('http', _('HTTP')),
    ('https', _('HTTPS')),
    ('tcp', _('TCP')),
)

def generate_uuid():
    return str(uuid.uuid4()).replace('-', '')

class Application(models.Model):
    uuid = models.CharField(max_length=36, null=True, blank=True, unique=True,
        default=generate_uuid)
    name = models.CharField(max_length=64, null=True)
    description = models.TextField(null=True, blank=True)
    domain_name = models.CharField(max_length=96, null=True,
        unique=True)
    backend_port = models.CharField(max_length=5, null=True)
    protocol = models.CharField(max_length=6, null=True,
        default='http', choices=PROTOCOL_CHOICES)
    containers = models.ManyToManyField(Container, null=True, blank=True,
        limit_choices_to=dict(id__in=[x.id for x in Container.get_running()]))
    owner = models.ForeignKey(User, null=True, blank=True)

    def __unicode__(self):
        return self.name

    def get_app_url(self):
        return '{0}://{1}'.format(self.protocol, self.domain_name)

    def get_memory_limit(self):
        mem = 0
        for c in self.containers.all():
            mem += c.get_memory_limit()
        return mem

    def save(self, *args, **kwargs):
        if self.pk is not None:
            original_domain = Application.objects.get(pk=self.pk).domain_name
            # check for changed domain
            if self.domain_name != original_domain:
                # if not original domain, remove hipache config
                tasks.remove_hipache_config(original_domain)
        super(Application, self).save(*args, **kwargs)

    def update_config(self):
        args = (self.id,)
        utils.get_queue('shipyard').enqueue(tasks.update_hipache, args=args)

def application_post_config(sender, **kwargs):
    app = kwargs.get('instance')
    args = (app.id,)
    utils.get_queue('shipyard').enqueue(tasks.update_hipache, args=args)

def remove_application_config(sender, **kwargs):
    app = kwargs.get('instance')
    args = (app.domain_name,)
    utils.get_queue('shipyard').enqueue(tasks.remove_hipache_config, args=args)

post_save.connect(application_post_config, sender=Application)
m2m_changed.connect(application_post_config,
    sender=Application.containers.through)
pre_delete.connect(remove_application_config, sender=Application)
