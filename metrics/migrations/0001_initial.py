# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Metric'
        db.create_table(u'metrics_metric', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, null=True, blank=True)),
            ('metric_type', self.gf('django.db.models.fields.CharField')(max_length=96, null=True, blank=True)),
            ('source', self.gf('django.db.models.fields.CharField')(max_length=96, null=True, blank=True)),
            ('counter', self.gf('django.db.models.fields.CharField')(max_length=96, null=True, blank=True)),
            ('value', self.gf('django.db.models.fields.IntegerField')(null=True, blank=True)),
            ('unit', self.gf('django.db.models.fields.CharField')(max_length=64, null=True, blank=True)),
        ))
        db.send_create_signal(u'metrics', ['Metric'])


    def backwards(self, orm):
        # Deleting model 'Metric'
        db.delete_table(u'metrics_metric')


    models = {
        u'metrics.metric': {
            'Meta': {'object_name': 'Metric'},
            'counter': ('django.db.models.fields.CharField', [], {'max_length': '96', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'metric_type': ('django.db.models.fields.CharField', [], {'max_length': '96', 'null': 'True', 'blank': 'True'}),
            'source': ('django.db.models.fields.CharField', [], {'max_length': '96', 'null': 'True', 'blank': 'True'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'null': 'True', 'blank': 'True'}),
            'unit': ('django.db.models.fields.CharField', [], {'max_length': '64', 'null': 'True', 'blank': 'True'}),
            'value': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['metrics']