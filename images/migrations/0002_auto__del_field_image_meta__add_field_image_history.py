# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Image.meta'
        db.delete_column(u'images_image', 'meta')

        # Adding field 'Image.history'
        db.add_column(u'images_image', 'history',
                      self.gf('django.db.models.fields.TextField')(default='{}', null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Image.meta'
        db.add_column(u'images_image', 'meta',
                      self.gf('django.db.models.fields.TextField')(default='{}', null=True, blank=True),
                      keep_default=False)

        # Deleting field 'Image.history'
        db.delete_column(u'images_image', 'history')


    models = {
        u'hosts.host': {
            'Meta': {'object_name': 'Host'},
            'agent_key': ('django.db.models.fields.CharField', [], {'default': "'4db8e9f201f54e33ad16320e2ba5d485'", 'max_length': '64', 'null': 'True'}),
            'enabled': ('django.db.models.fields.NullBooleanField', [], {'default': 'True', 'null': 'True', 'blank': 'True'}),
            'hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'unique': 'True', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64', 'unique': 'True', 'null': 'True'}),
            'port': ('django.db.models.fields.SmallIntegerField', [], {'default': '4243', 'null': 'True'}),
            'public_hostname': ('django.db.models.fields.CharField', [], {'max_length': '128', 'null': 'True', 'blank': 'True'})
        },
        u'images.image': {
            'Meta': {'object_name': 'Image'},
            'history': ('django.db.models.fields.TextField', [], {'default': "'{}'", 'null': 'True', 'blank': 'True'}),
            'host': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['hosts.Host']", 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image_id': ('django.db.models.fields.CharField', [], {'max_length': '96', 'null': 'True', 'blank': 'True'}),
            'repository': ('django.db.models.fields.CharField', [], {'max_length': '96'})
        }
    }

    complete_apps = ['images']