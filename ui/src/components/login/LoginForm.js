import React from 'react';

import { Message } from 'semantic-ui-react';

import Form from "../common/Form";
import { login } from '../../api';

const VALIDATION_CONFIG = {
  Username: {
    identifier: "Username",
    rules: [{
      type: "empty",
      prompt: "Please enter a username",
    }],
  },
  Password: {
    identifier: "Password",
    rules: [{
      type: "empty",
      prompt: "Please enter a password",
    }],
  },
};

export default class LoginForm extends React.Component {
  state = {
    error: null,
    loading: false,
    validationConfig: VALIDATION_CONFIG,
  };

  handleLoginError = (error) => {
    error.response.text()
      .then((text) => {
        this.setState({
          error: text,
          loading: false,
        });
      });
  };

  tryLogin = (e, values) => {
    this.setState({
      error: null,
      loading: true,
    });

    login(values.formData.Username, values.formData.Password)
      .then(this.props.successHandler)
      .catch(this.handleLoginError);

    e.preventDefault();
  };

  render() {
    const { error } = this.state;
    return (
      <Form inline={false} fields={this.state.validationConfig} onSubmit={this.tryLogin}>
        {error && (<Message negative>{this.state.error}</Message>)}
        <Message error />
        <Form.Input name="Username" icon="user" iconPosition="left" placeholder="Username" autoFocus />
        <Form.Input name="Password" icon="lock" iconPosition="left" placeholder="Password" type="password" />
        <Form.Button fluid inverted basic type="submit">Login</Form.Button>
      </Form>
    );
  }
}
