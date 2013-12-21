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
from hosts.models import Host
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, ButtonHolder, Submit, Button
from crispy_forms.bootstrap import FieldWithButtons, StrictButton, FormActions
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext as _

class HostForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(HostForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Fieldset(
                None,
                'name',
                'hostname',
                'public_hostname',
                'agent_key',
                'port',
            ),
            FormActions(
                Submit('save', _('Save'), css_class="btn btn-lg btn-success"),
            )
        )
        self.helper.form_id = 'form-edit-host'
        self.helper.form_class = 'form-horizontal'

    def clean_hostname(self):
        data = self.cleaned_data['hostname']
        if '/' in data and 'unix' not in data:
            raise forms.ValidationError(_('Please enter a hostname or IP only'))
        return data

    class Meta:
        model = Host
        fields = ('name', 'hostname', 'public_hostname', 'agent_key', 'port')

