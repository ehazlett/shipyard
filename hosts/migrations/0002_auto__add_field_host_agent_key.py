# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Host.agent_key'
        db.add_column(u'hosts_host', 'agent_key',
                      self.gf('django.db.models.fields.CharField')(default='7148e5296d224298aaab5d2d165e3117', max_length=64, null=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Host.agent_key'
        db.delete_column(u'hosts_host', 'agent_key')


    models = {
        u'hosts.host': {
            'Meta': {'object_name': 'Host'},
            'agent_key': ('django.db.models.fields.CharField', [], {'default': "'f466ddf07c6e4934959798044965ca26'", 'max_length': '64', 'null': 'True'}),
            'enabled': ('django.db.models.fields.NullBooleanField', [], {'default': 'True', 'null': 'True', 'blank': 'True'}),
            'hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'unique': 'True', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64', 'unique': 'True', 'null': 'True'}),
            'port': ('django.db.models.fields.SmallIntegerField', [], {'default': '4243', 'null': 'True'}),
            'public_hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['hosts']