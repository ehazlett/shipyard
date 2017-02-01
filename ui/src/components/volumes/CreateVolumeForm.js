import React from 'react';

import _ from 'lodash';
import { Form, Header } from 'semantic-ui-react';
import { Redirect } from "react-router-dom";
import { Form as FormsyForm } from 'formsy-react';
import { Input } from 'formsy-semantic-ui-react';

import InputGroup from '../common/InputGroup';
import { showError, showSuccess } from '../../lib';
import { createVolume } from '../../api';

export default class CreateVolumeForm extends React.Component {
  state = {
    loading: false,
    redirect: false,
    redirectTo: '',
  };


  createVolume = (values) => {
    createVolume({
      Name: values.Name,
      Driver: values.Driver,
      DriverOpts: _.chain(values.DriverOptions)
        .filter(v => { return v.Name })
        .keyBy('Name')
        .mapValues(v => { return v.Value })
        .value(),
    }).then((success) => {
        this.setState({
          redirect: true,
          redirectTo: `/volumes`,
        });
        showSuccess("Successfully created volume");
      })
      .catch((err) => {
        showError(err);
      });
  }

  render() {
    const {redirect, redirectTo} = this.state;
    return (
      <FormsyForm className="ui form" onValidSubmit={this.createVolume}>
        {redirect && <Redirect to={redirectTo}/>}

        <Header>Create a Volume</Header>

        <Form.Field>
          <label>Name</label>
          <Input name="Name" placeholder="volume-name" required></Input>
        </Form.Field>

        <Form.Field>
          <label>Volume Driver</label>
          <Input name="Driver" placeholder="local"></Input>
        </Form.Field>

        <Form.Field>
          <Header size="tiny">Driver Options</Header>
          <InputGroup inputName="DriverOptions" friendlyName="Driver Option" columns={["Name", "Value"]} />
        </Form.Field>

        <Form.Button color="green">Create Volume</Form.Button>
      </FormsyForm>
    );
  }
}
