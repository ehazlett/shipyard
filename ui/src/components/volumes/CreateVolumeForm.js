import React from "react";

import _ from "lodash";
import { Form, Header } from "semantic-ui-react";
import { Form as FormsyForm } from "formsy-react";
import { Input } from "formsy-semantic-ui-react";
import { Redirect } from "react-router-dom";

import Loader from "../common/Loader";
import ControlledInputGroup from "../common/ControlledInputGroup";

import { updateSpecFromInput, showError, showSuccess } from "../../lib";
import { createVolume } from "../../api";
import {
  keyValueColumns,
  keyValueValue
} from "../common/ControlledInputGroupHelpers";

export default class CreateVolumeForm extends React.Component {
  state = {
    redirect: false,
    redirectTo: "",
    loading: false,
    volume: {}
  };

  createVolume = values => {
    const { volume } = this.state;
    this.setState({
      loading: true
    });
    createVolume(volume)
      .then(success => {
        this.setState({
          redirect: true,
          redirectTo: `/volumes`,
          loading: false
        });
        showSuccess("Successfully created volume");
      })
      .catch(err => {
        showError(err);
        this.setState({
          loading: false
        });
      });
  };

  keyValueChangeHandler = (e, input) => {
    const updatedVolume = Object.assign({}, this.state.volume);
    _.set(
      updatedVolume,
      input.name,
      _.mapValues(_.keyBy(input.value, "key"), v => v.value || "")
    );
    this.setState({
      volume: updatedVolume
    });
  };

  onChangeHandler = (e, input) => {
    this.setState({
      volume: _.merge({}, updateSpecFromInput(input, this.state.volume))
    });
  };

  render() {
    const { loading, volume, redirect, redirectTo } = this.state;
    console.log(volume);

    if (loading) {
      return <Loader />;
    }

    return (
      <FormsyForm className="ui form" onValidSubmit={this.createVolume}>
        {redirect && <Redirect to={redirectTo} />}

        <Header>Create a Volume</Header>

        <Form.Field>
          <label>Name</label>
          <Input
            name="Name"
            placeholder="volume-name"
            value={_.get(volume, "Name", "")}
            onChange={this.onChangeHandler}
            required
          />
        </Form.Field>

        <Form.Field>
          <label>Volume Driver</label>
          <Input
            name="Driver"
            placeholder="local"
            value={_.get(volume, "Driver", "")}
            onChange={this.onChangeHandler}
          />
        </Form.Field>

        <Form.Field>
          <Header size="tiny">Driver Options</Header>
          <ControlledInputGroup
            friendlyName="Driver Option"
            name="DriverOpts"
            onChange={this.keyValueChangeHandler}
            columns={keyValueColumns}
            value={keyValueValue(_.get(volume, "DriverOpts", {}))}
          />
        </Form.Field>

        <Form.Button color="green">Create Volume</Form.Button>
      </FormsyForm>
    );
  }
}
