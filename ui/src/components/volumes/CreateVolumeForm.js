import React from 'react';

import _ from 'lodash';
import { Form, Header } from 'semantic-ui-react';
import { Redirect } from 'react-router';

import { createVolume } from '../../api';

export default class CreateVolumeForm extends React.Component {
  state = {
    error: null,
    loading: false,
    redirect: false,
    redirectTo: '',
  };


  createVolume = (e, values) => {
    const driverOpts = {};

    if (values.DriverOpts !== '') {
      const opts = values.DriverOpts.split(' ');
      _.forEach(opts, (o) => {
        const opt = o.split('=');
        driverOpts[opt[0]] = opt[1];
      });
    }

    createVolume({
      Name: values.Name,
      Driver: values.Driver,
      DriverOpts: driverOpts,
    }).then((success) => {
        this.setState({
          error: null,
          loading: false,
          redirect: true,
          redirectTo: `/volumes`,
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
    const {redirect, redirectTo} = this.state;
    return (
      <Form className="ui form" onSubmit={this.createVolume}>
        {redirect && <Redirect to={redirectTo}/>}
        <Header>Create a Volume</Header>
        <Form.Input name="Name" label="Name" placeholder="volume-name"></Form.Input>
        <Form.Input name="Driver" label="Driver" placeholder="local" defaultValue="local"></Form.Input>
        <Form.Input name="DriverOpts" label="Driver Options" placeholder="e.g. key1=value1 key2=value2"></Form.Input>
        <Form.Button color="green">Create Volume</Form.Button>
      </Form>
    );
  }
}
