# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Host'
        db.create_table(u'hosts_host', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=64, unique=True, null=True)),
            ('hostname', self.gf('django.db.models.fields.CharField')(max_length=128, unique=True, null=True)),
            ('public_hostname', self.gf('django.db.models.fields.CharField')(max_length=128, null=True, blank=True)),
            ('port', self.gf('django.db.models.fields.SmallIntegerField')(default=4243, null=True)),
            ('enabled', self.gf('django.db.models.fields.NullBooleanField')(default=True, null=True, blank=True)),
        ))
        db.send_create_signal(u'hosts', ['Host'])


    def backwards(self, orm):
        # Deleting model 'Host'
        db.delete_table(u'hosts_host')


    models = {
        u'hosts.host': {
            'Meta': {'object_name': 'Host'},
            'enabled': ('django.db.models.fields.NullBooleanField', [], {'default': 'True', 'null': 'True', 'blank': 'True'}),
            'hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'unique': 'True', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64', 'unique': 'True', 'null': 'True'}),
            'port': ('django.db.models.fields.SmallIntegerField', [], {'default': '4243', 'null': 'True'}),
            'public_hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['hosts']