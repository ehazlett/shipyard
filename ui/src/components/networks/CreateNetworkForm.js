import React from 'react';

import _ from 'lodash';
import { Grid, Button, Form, Header, Divider } from 'semantic-ui-react';
import { Form as FormsyForm } from 'formsy-react';
import { Input, Checkbox } from 'formsy-semantic-ui-react';
import { Redirect } from "react-router-dom";

import Loader from '../common/Loader';
import ControlledInputGroup from '../common/ControlledInputGroup';

import { updateSpecFromInput, showError, showSuccess } from '../../lib';
import { createNetwork } from '../../api';
import { keyValueColumns, keyValueValue } from '../common/ControlledInputGroupHelpers';

export default class CreateNetworkForm extends React.Component {
  state = {
    redirect: false,
    redirectTo: '',
    loading: false,
    network: {},
  };

  createNetwork = (values) => {
    this.setState({
      loading: true,
    });
    const { network } = this.state;
    createNetwork(network)
      .then((success) => {
        showSuccess('Successfully created network');
        this.setState({
          redirect: true,
          redirectTo: `/networks`,
          loading: false,
        });
      })
      .catch((err) => {
        showError(err);
        this.setState({
          loading: false,
        });
      });
  }

  onChangeHandler = (e, input) => {
    this.setState({
      network: _.merge({}, updateSpecFromInput(input, this.state.network)),
    });
  }

	keyValueChangeHandler = (e, input) => {
		const updatedNetwork = Object.assign({}, this.state.network);
    _.set(
      updatedNetwork,
      input.name,
      _.mapValues(
        _.keyBy(input.value, "key"),
        (v) => v.value || ""
      )
    );
    this.setState({
      network: updatedNetwork,
    });
	}

  ipamConfigColumns = [
		{
			name: "Subnet",
			accessor: "Subnet",
		},
		{
			name: "IP Range",
			accessor: "IPRange",
		},
		{
			name: "Gateway",
			accessor: "Gateway",
		},
		{
			name: "Aux Address",
			accessor: "AuxAddress",
		},
  ];

  render() {
    const { loading, network, redirect, redirectTo } = this.state;

    if(loading) {
      return <Loader />;
    }

    return (
      <FormsyForm className="ui form" onValidSubmit={this.createNetwork}>
        {redirect && <Redirect to={redirectTo}/>}
        <Header>Create a Network</Header>
        <Form.Field>
          <label>Name</label>
          <Input
            name="Name"
            placeholder="network-name"
            value={_.get(network, "Name", "")}
            onChange={this.onChangeHandler}
            required
          />
        </Form.Field>
        <Form.Group inline>
          <Form.Field>
            <Checkbox
              name="Internal"
              label="Internal network"
              checked={_.get(network, "Internal", false)}
              onChange={this.onChangeHandler}
            />
            </Form.Field>
          <Form.Field>
            <Checkbox
              name="EnableIPv6"
              label="Enable IPv6"
              checked={_.get(network, "EnableIPv6", false)}
              onChange={this.onChangeHandler}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              name="CheckDuplicate"
              label="Check Duplicate"
              checked={_.get(network, "CheckDuplicate", false)}
              onChange={this.onChangeHandler}
            />
          </Form.Field>
        </Form.Group>

        <Header size="small">Labels</Header>
        <ControlledInputGroup
          name="Labels"
          friendlyName="Label"
          columns={keyValueColumns}
          value={keyValueValue(_.get(network, "Labels", {}))}
          onChange={this.keyValueChangeHandler}
        />

        <Header size="small" dividing>Network Driver</Header>
        <Grid>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <label>Driver Name</label>
              <Input
                name="Driver"
                placeholder="e.g. bridge or overlay"
                value={_.get(network, "Driver", "")}
                onChange={this.onChangeHandler}
                fluid
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <Header size="tiny">Driver Options</Header>
              <ControlledInputGroup
                name="Options"
                friendlyName="Driver Option"
                columns={keyValueColumns}
                value={keyValueValue(_.get(network, "Options", {}))}
                onChange={this.keyValueChangeHandler}
              />
            </Form.Field>
          </Grid.Column>
        </Grid>

        <Header size="small" dividing>IPAM</Header>
        <Grid>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <label>IPAM Driver Name</label>
              <Input
                name="IPAM.Driver"
                placeholder="default"
                value={_.get(network, "IPAM.Driver", "")}
                onChange={this.onChangeHandler}
                fluid
              />
            </Form.Field>
          </Grid.Column>
          <Grid.Column mobile={16} tablet={16} computer={8} largeScreen={8}>
            <Form.Field>
              <label>IPAM Driver Options</label>
              <ControlledInputGroup
                name="IPAM.Options"
                friendlyName="IPAM Driver Option"
                columns={keyValueColumns}
                value={keyValueValue(_.get(network, "IPAM.Driver", {}))}
                onChange={this.keyValueChangeHandler}
              />
            </Form.Field>
          </Grid.Column>
        </Grid>

        <Header size="tiny">IPAM Configuration</Header>
        <ControlledInputGroup
          name="IPAM.Config"
          friendlyName="IPAM Configuration"
          columns={this.ipamConfigColumns}
          value={_.get(network, "IPAM.Config", [])}
          onChange={this.onChangeHandler}
        />

        <Divider hidden />

        <Button color="green">Create Network</Button>

      </FormsyForm>
    );
  }
}
