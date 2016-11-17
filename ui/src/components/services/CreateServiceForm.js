import React from 'react';

import { Message, Header, Divider } from 'semantic-ui-react';
import { Redirect } from 'react-router';

import Form from '../common/Form';
import { createService, dockerErrorHandler } from '../../api';

const VALIDATION_CONFIG = {
  Image:{
		identifier: 'Image',
		rules: [{
			type: 'empty',
		}],
	},
  Mode: {
		identifier: 'Mode',
		rules: [{
			type: 'empty',
			prompt: 'Please select a scheduler mode',
		}],
	},
};

export default class CreateServiceForm extends React.Component {
  state = {
    error: null,
    loading: false,
    redirect: false,
    redirectTo: '',
		validationConfig: VALIDATION_CONFIG,
  };

  createService = (e, values) => {
    e.preventDefault();

    createService({
      Name: values.Name,
      TaskTemplate: {
        ContainerSpec: {
          Image: values.Image,
          Args: values.Args ? values.Args.split(' ') : null,
          Command: values.Command ? values.Command.split(' ') : null,
          User: values.User ? values.User : null,
          Dir: values.Dir ? values.Dir : null,
          Groups: values.Command ? values.Command.split(' ') : null,
					TTY: values.TTY,
					OpenStdin: values.OpenStdin,
        },
      },
      Mode: {
        Replicated: {
          Replicas: parseInt(values.Replicas, 10) || 1,
        },
      },
    })
      .then((success) => {
        this.setState({
          error: null,
          loading: false,
          redirect: true,
          redirectTo: `/services/inspect/${success.body.ID}`,
        });
      })
      .catch((error) => {
				dockerErrorHandler(error.response)
					.then((parsedError) => {
						this.setState({
							error: parsedError.desc,
							loading: false
						});
					});
      });
  }

	updateValidationConfig = (key, value) => {
		const validationConfig = Object.assign({}, this.state.validationConfig);

		if(key === 'Mode' && value === 'Replicated') {
			validationConfig.Replicas = {
				identifier: 'Replicas',
				rules: [{
					type: 'empty',
				}],
			};
		} else {
			delete validationConfig.Replicas;
		}

		this.setState({
			validationConfig,
		});
	};


	handleChange = (key, e) => {
		this.updateValidationConfig(key, e.target.value);
		this.setState({
			[key]: e.target.value,
		});
	}

  render() {
    const { redirect, redirectTo, Mode, error } = this.state;
    return (
      <Form inline fields={this.state.validationConfig} onSubmit={this.createService}>
        {redirect && <Redirect to={redirectTo}/>}
				{error && <Message negative>{error}</Message>}
        <Header>Create a Service</Header>
				<Form.Group widths="equal">
					<Form.Input name="Image" label="Image" placeholder="dockercloud/hello-world" required />
					<Form.Input name="Name" label="Service Name" placeholder="hello-world" />
				</Form.Group>

				<Divider hidden />

				<Form.Group widths="equal">
					<Form.Input name="Command" label="Command" placeholder="Default" />
					<Form.Input name="Args" label="Args" placeholder="Default" />
				</Form.Group>

				<Divider hidden />

        <Form.Group widths="equal">
					<Form.Field name="Mode" label="Mode" onChange={(e) => this.handleChange('Mode', e)} control="select" required>
						<option value=""></option>
						<option value="Replicated">Replicated</option>
						<option value="Global">Global</option>
					</Form.Field>
          <Form.Input name="Replicas" label="Replicas" type="number" disabled={Mode !== 'Replicated'} required={Mode === 'Replicated'} placeholder={1} />
        </Form.Group>

				<Divider hidden />

				<Form.Group widths="equal">
					<Form.Input name="User" label="User" placeholder="nobody" />
					<Form.Input name="Dir" label="Working Directory" placeholder="/usr/src/app" />
					<Form.Input name="Groups" label="Groups" placeholder="group1 group2" />
				</Form.Group>

				{/* These don't seem to do anything at the moment 
				<Form.Field>
					<label>Stream Options</label>
					<Form.Group inline>
						<Form.Checkbox label='Attach TTY' name='TTY' />
						<Form.Checkbox label='Open stdin' name='OpenStdin' />
					</Form.Group>
				</Form.Field>
				*/}

				<Divider hidden />
        <Form.Button color="green">Create Service</Form.Button>
      </Form>
    );
  }
}
