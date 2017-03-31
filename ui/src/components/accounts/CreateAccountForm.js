import React from "react";

import _ from "lodash";
import { Form, Header, Divider } from "semantic-ui-react";
import { Form as FormsyForm } from "formsy-react";
import { Input, Select } from "formsy-semantic-ui-react";
import { Redirect } from "react-router-dom";

import Loader from "../common/Loader";

import { updateSpecFromInput, showError, showSuccess } from "../../lib";
import { createAccount } from "../../api";
import { accountRoles } from "./AccountFormHelpers";

export default class CreateAccountForm extends React.Component {
  state = {
    redirect: false,
    redirectTo: "",
    spec: {}
  };

  createAccount = () => {
    const { spec } = this.state;
    this.setState({
      loading: true
    });
    createAccount(spec)
      .then(success => {
        this.setState({
          redirect: true,
          redirectTo: `/accounts`,
          loading: false
        });
        showSuccess("Successfully created account");
      })
      .catch(err => {
        showError(err);
        this.setState({
          loading: true
        });
      });
  };

  onChangeHandler = (e, input) => {
    this.setState({
      spec: _.merge({}, updateSpecFromInput(input, this.state.spec))
    });
  };

  render() {
    const { loading, redirect, redirectTo, spec } = this.state;

    if (loading) {
      return <Loader />;
    }

    return (
      <FormsyForm
        className="ui form"
        onValidSubmit={this.createAccount}
        noValidate
      >
        {redirect && <Redirect to={redirectTo} />}
        <Header>Create an Account</Header>

        <Form.Field className="required">
          <label>Username</label>
          <Input
            name="username"
            value={_.get(spec, "username", "")}
            onChange={this.onChangeHandler}
            required
          />
        </Form.Field>

        <Form.Group widths="equal">
          <Form.Field>
            <label>First Name</label>
            <Input
              name="first_name"
              placeholder=""
              value={_.get(spec, "first_name", "")}
              onChange={this.onChangeHandler}
            />
          </Form.Field>
          <Form.Field>
            <label>Last Name</label>
            <Input
              name="last_name"
              placeholder=""
              value={_.get(spec, "last_name", "")}
              onChange={this.onChangeHandler}
            />
          </Form.Field>
        </Form.Group>

        <Form.Field>
          <label>Roles</label>
          <Select
            name="roles"
            placeholder="Select user roles"
            multiple
            options={accountRoles}
            value={_.get(spec, "roles", [])}
            onChange={this.onChangeHandler}
            fluid
          />
        </Form.Field>

        <Form.Field className="required">
          <label>Password</label>
          <Input
            name="password"
            value={_.get(spec, "password", "")}
            onChange={this.onChangeHandler}
            type="password"
            required
          />
        </Form.Field>

        <Form.Field className="required">
          <label>Repeat Password</label>
          <Input
            name="passwordConfirm"
            type="password"
            validations="equalsField:password"
            required
          />
        </Form.Field>

        <Divider hidden />

        <Form.Button color="green">Create Account</Form.Button>
      </FormsyForm>
    );
  }
}
