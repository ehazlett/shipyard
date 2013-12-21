# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Image'
        db.create_table(u'images_image', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('image_id', self.gf('django.db.models.fields.CharField')(max_length=96, null=True, blank=True)),
            ('repository', self.gf('django.db.models.fields.CharField')(max_length=96)),
            ('host', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['hosts.Host'], null=True)),
            ('meta', self.gf('django.db.models.fields.TextField')(default='{}', null=True, blank=True)),
        ))
        db.send_create_signal(u'images', ['Image'])


    def backwards(self, orm):
        # Deleting model 'Image'
        db.delete_table(u'images_image')


    models = {
        u'hosts.host': {
            'Meta': {'object_name': 'Host'},
            'agent_key': ('django.db.models.fields.CharField', [], {'default': "'aabe70f9ac4743ec85def7b760540f55'", 'max_length': '64', 'null': 'True'}),
            'enabled': ('django.db.models.fields.NullBooleanField', [], {'default': 'True', 'null': 'True', 'blank': 'True'}),
            'hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'unique': 'True', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64', 'unique': 'True', 'null': 'True'}),
            'port': ('django.db.models.fields.SmallIntegerField', [], {'default': '4243', 'null': 'True'}),
            'public_hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'})
        },
        u'images.image': {
            'Meta': {'object_name': 'Image'},
            'host': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['hosts.Host']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image_id': ('django.db.models.fields.CharField', [], {'max_length': '96', 'null': 'True', 'blank': 'True'}),
            'meta': ('django.db.models.fields.TextField', [], {'default': "'{}'", 'null': 'True', 'blank': 'True'}),
            'repository': ('django.db.models.fields.CharField', [], {'max_length': '96'})
        }
    }

    complete_apps = ['images']