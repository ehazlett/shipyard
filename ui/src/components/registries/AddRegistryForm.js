import React from 'react';

import _ from 'lodash';
import { Form, Header } from 'semantic-ui-react';
import { Form as FormsyForm } from 'formsy-react';
import { Input } from 'formsy-semantic-ui-react';
import { Redirect } from "react-router-dom";

import { addRegistry } from '../../api';
import { updateSpecFromInput, showError, showSuccess } from '../../lib';

export default class AddRegistryForm extends React.Component {

  state = {
    loading: false,
    redirect: false,
    redirectTo: '',
    spec: {},
  };

  addRegistry = () => {
		const { spec } = this.state;
		this.setState({
			loading: true,
		})
    addRegistry(spec)
      .then((success) => {
        this.setState({
          redirect: true,
          redirectTo: `/registries`,
					loading: false,
        });
				showSuccess("Successfully added registry");
      })
      .catch((err) => {
				showError(err);
				this.setState({
					loading: true,
				});
      });
  }

  onChangeHandler = (e, input) => {
    this.setState({
      spec: _.merge({}, updateSpecFromInput(input, this.state.spec)),
    });
  }

  render() {
    const { spec, redirect, redirectTo } = this.state;
    return (
      <FormsyForm className="ui form" onValidSubmit={this.addRegistry} noValidate>
        {redirect && <Redirect to={redirectTo}/>}
        <Header>Add a Registry</Header>

				<Form.Field className="required">
					<label>Name</label>
          <Input
            name="name"
            placeholder="my-registry"
            value={_.get(spec, "name", "")}
            onChange={this.onChangeHandler}
            />
        </Form.Field>

				<Form.Field className="required">
					<label>Address</label>
          <Input
            name="addr"
            placeholder="http://registry.example.org:5000"
            value={_.get(spec, "addr", "")}
            onChange={this.onChangeHandler}
            />
        </Form.Field>

				<Form.Group widths="equal">
          <Form.Field>
            <label>Username</label>
            <Input
              name="username"
              value={_.get(spec, "username", "")}
              onChange={this.onChangeHandler}
              />
          </Form.Field>
          <Form.Field>
            <label>Password</label>
            <Input
              name="password"
              value={_.get(spec, "password", "")}
              onChange={this.onChangeHandler}
              type="password"
            />
          </Form.Field>
				</Form.Group>

        <Form.Button color="green">Add Registry</Form.Button>
      </FormsyForm>
    );
  }
}
