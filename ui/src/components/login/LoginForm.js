import React from "react";

import { Label, Form, Message } from "semantic-ui-react";
import { Form as FormsyForm } from "formsy-react";
import { Input } from "formsy-semantic-ui-react";

import { login } from "../../api";

export default class LoginForm extends React.Component {
  state = {
    error: null,
    loading: false
  };

  handleLoginError = error => {
    error.response.text().then(text => {
      this.setState({
        error: text,
        loading: false
      });
    });
  };

  tryLogin = values => {
    this.setState({
      error: null,
      loading: true
    });

    login(values.Username, values.Password)
      .then(this.props.successHandler)
      .catch(this.handleLoginError);
  };

  render() {
    const { error } = this.state;
    const el = <Label color="red" pointing basic />;
    return (
      <FormsyForm className="ui form" onValidSubmit={this.tryLogin} noValidate>
        {error && <Message negative>{this.state.error}</Message>}
        <Message error />
        <Form.Field>
          <Input
            name="Username"
            icon="user"
            iconPosition="left"
            placeholder="Username"
            autoFocus
            validationErrors={{
              isDefaultRequiredValue: "Username is required"
            }}
            errorLabel={el}
            required
          />
        </Form.Field>
        <Form.Field>
          <Input
            name="Password"
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            type="password"
            validationErrors={{
              isDefaultRequiredValue: "Password is required"
            }}
            errorLabel={el}
            required
          />
        </Form.Field>
        <Form.Button fluid inverted basic type="submit">Login</Form.Button>
      </FormsyForm>
    );
  }
}
