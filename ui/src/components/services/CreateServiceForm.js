import React from "react";


import _ from 'lodash';
import { Form, Header, Divider } from 'semantic-ui-react';
import { Form as FormsyForm } from 'formsy-react';
import { Input, Select, Checkbox } from 'formsy-semantic-ui-react';
import { Redirect } from "react-router-dom";

import ControlledInputGroup from '../common/ControlledInputGroup';
import Loader from '../common/Loader';

import { updateSpecFromInput, showError, showSuccess } from '../../lib';
import { createService } from "../../api";

export default class CreateServiceForm extends React.Component {
  state = {
    redirect: false,
    redirectTo: "",
		spec: {
			Mode: {
				Replicated: {
					Replicas: 1,
				},
			},
		},
  };

  createService = () => {
		const { spec } = this.state;
		this.setState({
			loading: true,
		})
    createService(spec)
      .then((success) => {
        this.setState({
          redirect: true,
          redirectTo: `/services`,
					loading: false,
        });
				showSuccess("Successfully created service");
      })
      .catch((err) => {
				showError(err);
				this.setState({
					loading: true,
				});
      });
  }

	mountTypes = [
		{ text: "Volume", value: "volume" },
		{ text: "Bind", value: "bind" },
	];

	readOnlyOptions = [
		{ text: "Read Only", value: "true" },
		{ text: "Read/Write", value: "false" },
	];

	modes = [
		{text: "Replicated", value: "Replicated"},
		{text: "Global", value: "Global"},
	];

  onChangeHandler = (e, input) => {
    this.setState({
      spec: _.merge({}, updateSpecFromInput(input, this.state.spec)),
    });
  }

	// TODO: Find a new home for this
	stringAsArrayChangeHandler = (e, input) => {
		const updatedSpec = Object.assign({}, this.state.spec);
		_.set(updatedSpec, input.name, input.value.split(" "));
    this.setState({
      spec: updatedSpec,
    });
	}

	// TODO: Find a new home for this
	serviceModeChangeHandler = (e, input) => {
		const updatedSpec = Object.assign({}, this.state.spec);
		_.set(updatedSpec, input.name, { [input.value]: {} });
    this.setState({
      spec: updatedSpec,
    });
	}

	serviceModeValueHandler = () => {
		if(_.has(this.state.spec, "Mode.Replicated")) {
			return "Replicated";
		} else if(_.has(this.state.spec, "Mode.Global")) {
			return "Global";
		} else {
			return "";
		}
	}

	mountsControlledInputGroup = [
		{
			name: "Type",
			accessor: "MountType",
			component: Select,
			props: {
				options: this.mountTypes,
				placeholder: "Type",
				required: true,
			}
		},
		{
			name: "Source",
			accessor: "Source",
		},
		{
			name: "Target",
			accessor: "Target",
			props: {
				required: true,
			}
		},
		{
			name: "Volume Driver",
			accessor: "Driver",
		},
		{
			name: "Permission",
			accessor: "ReadOnly",
			component: Select,
			props: {
				options: this.readOnlyOptions,
				placeholder: "Type",
				required: true,
			}
		},
	];

	constraintsControlledInputGroup = [
		{
			name: "Placement Constraint",
			props: {
				placeholder: "node.labels.type == queue"
			}
		}
	];

  render() {
    const { loading, redirect, redirectTo, spec } = this.state;

		if(loading) {
			return <Loader />;
		}

    return (
      <FormsyForm className="ui form" onValidSubmit={this.createService}>
        {redirect && <Redirect to={redirectTo}/>}
        <Header>Create a Service</Header>

				<Form.Group widths="equal">
					<Form.Field className="required">
						<label>Image</label>
						<Input
							name="TaskTemplate.ContainerSpec.Image"
							placeholder="dockercloud/hello-world"
							value={_.get(spec, "TaskTemplate.ContainerSpec.Image", "")}
							onChange={this.onChangeHandler}
							required
							/>
					</Form.Field>
					<Form.Field>
						<label>Name</label>
						<Input
							name="Name"
							placeholder="hello_world"
							value={_.get(spec, "Name", "")}
							onChange={this.onChangeHandler}
							/>
					</Form.Field>
				</Form.Group>

        <Divider hidden />

        <Form.Field>
          <label>Stream Options</label>
          <Form.Group inline>
						<Checkbox
							label="Attach TTY"
							name="TaskTemplate.ContainerSpec.TTY"
							checked={_.get(spec, "TaskTemplate.ContainerSpec.TTY", false)}
							onChange={this.onChangeHandler}
							/>
          </Form.Group>
        </Form.Field>

        <Divider hidden />

        <Form.Group widths="equal">
					<Form.Field>
						<label>Command</label>
						<Input
							name="TaskTemplate.ContainerSpec.Command"
							placeholder="/bin/bash"
							value={_.chain(spec).get("TaskTemplate.ContainerSpec.Command", "").join(" ").value()}
							onChange={this.stringAsArrayChangeHandler}
							/>
					</Form.Field>
					<Form.Field>
						<label>Args</label>
						<Input
							name="TaskTemplate.ContainerSpec.Args"
							placeholder="echo hello"
							value={_.chain(spec).get("TaskTemplate.ContainerSpec.Args", "").join(" ").value()}
							onChange={this.stringAsArrayChangeHandler}
							/>
					</Form.Field>
        </Form.Group>

        <Divider hidden />

        <Form.Group widths="equal">
					<Form.Field className="required">
						<label>Mode</label>
						<Select
							name="TaskTemplate.Mode"
							options={this.modes}
							placeholder="Mode"
							fluid
							required
							value={this.serviceModeValueHandler()}
							onChange={this.serviceModeChangeHandler}
							/>
					</Form.Field>
					<Form.Field className="required">
						<label>Replicas</label>
						<Input
							name="Mode.Replicated.Replicas"
							type="number"
							disabled={!_.has(spec, "Mode.Replicated")}
							required={_.has(spec, "Mode.Replicated")}
							value={_.get(spec, "Mode.Replicated.Replicas", "")}
							onChange={this.onChangeHandler}
							placeholder={1}
							/>
					</Form.Field>
        </Form.Group>

        <Divider hidden />

        <Form.Group widths="equal">
					<Form.Field>
						<label>User</label>
						<Input
							name="TaskTemplate.ContainerSpec.User"
							placeholder="nobody"
							value={_.get(spec, "TaskTemplate.ContainerSpec.User", "")}
							onChange={this.onChangeHandler}
							/>
					</Form.Field>
					<Form.Field>
						<label>Dir</label>
						<Input
							name="TaskTemplate.ContainerSpec.Dir"
							placeholder="/usr/src/app"
							value={_.get(spec, "TaskTemplate.ContainerSpec.Dir", "")}
							onChange={this.onChangeHandler}
							/>
					</Form.Field>
					<Form.Field>
						<label>Groups</label>
						<Input
							name="TaskTemplate.ContainerSpec.Groups"
							placeholder="group1 group2"
							value={_.chain(spec).get("TaskTemplate.ContainerSpec.Groups", "").join(" ").value()}
							onChange={this.stringAsArrayChangeHandler}
							/>
					</Form.Field>
        </Form.Group>

        <Divider />
				<Form.Field>
					<label>Mounts</label>
					<ControlledInputGroup
						columns={this.mountsControlledInputGroup}
						friendlyName="Mount"
						name="TaskTemplate.ContainerSpec.Mounts"
						value={_.get(spec, "TaskTemplate.ContainerSpec.Mounts", [])}
						onChange={this.onChangeHandler}
						/>
				</Form.Field>

        <Divider />
				<Form.Field>
					<label>Constraints</label>
					<ControlledInputGroup
						columns={this.constraintsControlledInputGroup}
						friendlyName="Constraint"
						name="TaskTemplate.ContainerSpec.PlacementConstraints"
						value={_.get(spec, "TaskTemplate.ContainerSpec.PlacementConstraints", [])}
						onChange={this.onChangeHandler}
						singleColumn
						/>
				</Form.Field>

        <Divider hidden />

        <Form.Button color="green">Create Service</Form.Button>
      </FormsyForm>
    );
  }
}
