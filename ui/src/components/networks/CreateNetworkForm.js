import React from 'react';

import _ from 'lodash';
import { Grid, Form, Header, Button, Divider } from 'semantic-ui-react';
import { Form as FormsyForm } from 'formsy-react';
import { Input, Checkbox } from 'formsy-semantic-ui-react';
import { Redirect } from "react-router-dom";

import InputGroup from '../common/InputGroup';
import { createNetwork } from '../../api';
import { showError, showSuccess } from '../../lib';

export default class CreateNetworkForm extends React.Component {
  state = {
    redirect: false,
    redirectTo: '',
  };

  createNetwork = (values) => {
    createNetwork({
      Name: values.Name,
      Driver: values.Driver,

      Options: _.chain(values.DriverOptions)
        .filter(v => { return v.Name })
        .keyBy('Name')
        .mapValues(v => { return v.Value })
        .value(),

      Labels: _.chain(values.Labels)
        .filter(v => { return v.Name })
        .keyBy('Name')
        .mapValues(v => { return v.Value })
        .value(),

      Internal: values.Internal,
      EnableIPv6: values.EnableIPv6,
      CheckDuplicate: values.CheckDuplicate,

      IPAM: {
        Driver: values.IPAMDriver,
        Config: values.IPAMConfigs,
        Options: _.chain(values.IPAMDriverOptions)
          .filter(v => { return v.Name })
          .keyBy('Name')
          .mapValues(v => { return v.Value })
          .value(),
      },
    })
      .then((success) => {
        showSuccess('Successfully created network');
        this.setState({
          redirect: true,
          redirectTo: `/networks`,
        });
      })
      .catch((err) => {
        showError(err);
      });
  }

  render() {
    const {redirect, redirectTo} = this.state;
    return (
      <FormsyForm className="ui form" onValidSubmit={this.createNetwork}>
        {redirect && <Redirect to={redirectTo}/>}
        <Header>Create a Network</Header>
        <Form.Field>
          <label>Name</label>
          <Input name="Name" placeholder="network-name" validations="minLength:1" required />
        </Form.Field>
        <Form.Group inline>
          <Form.Field><Checkbox name="Internal" label="Internal network" /></Form.Field>
          <Form.Field><Checkbox name="EnableIPv6" label="Enable IPv6" /></Form.Field>
          <Form.Field><Checkbox name="CheckDuplicate" label="Check Duplicate" /></Form.Field>
        </Form.Group>

        <Header size="small">Labels</Header>
        <InputGroup inputName="Labels" friendlyName="Label" columns={["Name", "Value"]} />

        <Header size="small" dividing>Network Driver</Header>
        <Grid>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <label>Driver Name</label>
              <Input name="Driver" placeholder="e.g. bridge or overlay" fluid />
            </Form.Field>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <Header size="tiny">Driver Options</Header>
              <InputGroup inputName="DriverOptions" friendlyName="Driver Option" columns={["Name", "Value"]} />
            </Form.Field>
          </Grid.Column>
        </Grid>

        <Header size="small" dividing>IPAM</Header>
        <Grid>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <label>IPAM Driver Name</label>
              <Input name="IPAMDriver" placeholder="default" fluid />
            </Form.Field>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <label>IPAM Driver Options</label>
              <InputGroup inputName="IPAMDriverOptions" friendlyName="IPAM Driver Option" columns={["Name", "Value"]} />
            </Form.Field>
          </Grid.Column>
        </Grid>

        <Header size="tiny">IPAM Configuration</Header>
        <InputGroup inputName="IPAMConfigs" friendlyName="IPAM Configuration" columns={["Subnet", "IP Range", "Gateway", "AuxAddress"]} />

        <Divider hidden />

        <Button color="green">Create Network</Button>

      </FormsyForm>
    );
  }
}
