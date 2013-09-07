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
from django.utils.translation import ugettext as _
from applications.models import Application
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, ButtonHolder, Submit
from crispy_forms.bootstrap import FieldWithButtons, StrictButton, FormActions
from django.core.urlresolvers import reverse
from applications.models import PROTOCOL_CHOICES

def get_available_hosts():
    return Host.objects.filter(enabled=True)

class ApplicationForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ApplicationForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Fieldset(
                None,
                'name',
                'description',
                'domain_name',
                'backend_port',
                'protocol',
            ),
            FormActions(
                Submit('save', _('Create'), css_class="btn btn-lg btn-success"),
            )
        )
        self.helper.form_id = 'form-create-application'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('applications.views.create')

    class Meta:
        model = Application
        fields = ('name', 'description', 'domain_name', 'backend_port',
            'protocol')

class EditApplicationForm(forms.Form):
    uuid = forms.CharField(required=True, widget=forms.HiddenInput())
    name = forms.CharField(required=True)
    description = forms.CharField(required=False)
    domain_name = forms.CharField(required=True)
    backend_port = forms.CharField(required=True)
    protocol = forms.ChoiceField(required=True)

    def __init__(self, *args, **kwargs):
        super(EditApplicationForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'form-edit-application'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('applications.views.edit')
        self.helper.help_text_inline = True
        self.fields['protocol'].choices = PROTOCOL_CHOICES

