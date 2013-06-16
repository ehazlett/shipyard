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
from django import forms
from containers.models import Host
from crispy_forms.helper import FormHelper
from django.core.urlresolvers import reverse

def get_image_choices():
    hosts = Host.objects.all()
    choices = []
    for h in hosts:
        for i in h.get_images():
            image_name = '{0}:{1}'.format(i.get('Repository'), i.get('Tag'))
            d = (image_name, '{0}/{1}'.format(
                i.get('Repository'), i.get('Tag')))
            choices.append(d)
    return choices

class HostForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(HostForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'form-add-host'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('containers.views.add_host')

    class Meta:
        model = Host
        fields = ('name', 'hostname', 'port')

class CreateContainerForm(forms.Form):
    image = forms.ChoiceField()
    command = forms.CharField(required=False)
    ports = forms.CharField(required=False, help_text='space separated')
    hosts = forms.MultipleChoiceField()

    def __init__(self, *args, **kwargs):
        super(CreateContainerForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'form-create-container'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('containers.views.create_container')
        self.helper.help_text_inline = True
        self.fields['image'].choices = [('', '----------')] + \
            [x for x in get_image_choices()]
        self.fields['hosts'].choices = \
            [(x.id, x.name) for x in Host.objects.filter(enabled=True)]

class ImportImageForm(forms.Form):
    repository = forms.CharField()
    hosts = forms.MultipleChoiceField()

    def __init__(self, *args, **kwargs):
        super(ImportImageForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'form-import-image'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('containers.views.import_image')
        self.helper.help_text_inline = True
        self.fields['hosts'].choices = \
            [(x.id, x.name) for x in Host.objects.filter(enabled=True)]

class ContainerForm(forms.Form):
    image = forms.ChoiceField()
    command = forms.CharField(required=False)

    def __init__(self, *args, **kwargs):
        super(CreateContainerForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'form-create-container'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('containers.views.create_container')
        self.helper.help_text_inline = True
        self.fields['image'].widget.attrs['readonly'] = True
