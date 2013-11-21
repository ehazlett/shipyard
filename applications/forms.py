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
from containers.models import Container
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, ButtonHolder, Submit, Field
from crispy_forms.bootstrap import FieldWithButtons, StrictButton, FormActions
from django.core.urlresolvers import reverse
from applications.models import PROTOCOL_CHOICES

def get_available_hosts():
    return Host.objects.filter(enabled=True)

class ApplicationForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ApplicationForm, self).__init__(*args, **kwargs)
        # set height for container select
        container_list_length = len(Container.get_running())
        if container_list_length > 20:
            container_list_length = 20
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Fieldset(
                None,
                'name',
                'description',
                'domain_name',
                'host_interface',
                'backend_port',
                'protocol',
                Field('containers', size=container_list_length),
            ),
            FormActions(
                Submit('save', _('Update'), css_class="btn btn-lg btn-success"),
            )
        )
        self.helper.form_id = 'form-create-application'
        self.helper.form_class = 'form-horizontal'
        self.helper.form_action = reverse('applications.views.create')

    def clean(self):
        data = super(ApplicationForm, self).clean()

        if len(data.get('containers', [])) == 0:
            return data

        port = data.get('backend_port')
        interface = data.get('host_interface') or '0.0.0.0'
        for c in data.get('containers', []):
            port_proto = "{0}/tcp".format(port)
            container_ports = c.get_ports()
            if not port_proto in container_ports:
                msg = _(u'Port %s is not available on the selected containers.' % port_proto)
                self._errors['backend_port'] = self.error_class([msg])
            if not container_ports.get(port_proto, {}).get(interface):
                msg = _(u'Port %s is not bound to the interface %s on the selected containers.' % (port_proto, interface))
                self._errors['host_interface'] = self.error_class([msg])

        return data

    class Meta:
        model = Application
        fields = ('name', 'description', 'domain_name', 'host_interface', 'backend_port',
            'protocol', 'containers')

class EditApplicationForm(forms.Form):
    uuid = forms.CharField(required=True, widget=forms.HiddenInput())
    name = forms.CharField(required=True)
    description = forms.CharField(required=False)
    domain_name = forms.CharField(required=True)
    host_interface = forms.CharField(required=False)
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

