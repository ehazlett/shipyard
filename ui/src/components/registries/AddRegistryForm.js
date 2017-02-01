import React from 'react';

import _ from 'lodash';
import { Form, Message, Header } from 'semantic-ui-react';
import { Redirect } from "react-router-dom";

import { addRegistry } from '../../api';

export default class AddRegistryForm extends React.Component {
  state = {
    error: null,
    loading: false,
    redirect: false,
    redirectTo: '',
  };


  addRegistry = (e, values) => {

    addRegistry({
      Name: values.formData.Name,
      Addr: values.formData.Addr,
      Username: values.formData.Username,
      Password: values.formData.Password,
    }).then((success) => {
        this.setState({
          error: null,
          loading: false,
          redirect: true,
          redirectTo: `/registries`,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false
        });
      });

    e.preventDefault();
  }

  render() {
    const {error, redirect, redirectTo} = this.state;
    return (
      <Form className="ui form" onSubmit={this.addRegistry}>
        {redirect && <Redirect to={redirectTo}/>}
        <Header>Add a Registry</Header>
        {error && <Message negative>{JSON.stringify(error)}</Message>}
        <Message error />
        <Form.Input name="Name" label="Name" placeholder="my-registry"></Form.Input>
        <Form.Input name="Addr" label="Address" placeholder="http://registry.example.org:5000"></Form.Input>
        <Form.Input name="Username" label="Username" placeholder="Username"></Form.Input>
        <Form.Input name="Password" type="password" label="Password"></Form.Input>
        <Form.Button color="green">Add Registry</Form.Button>
      </Form>
    );
  }
}
