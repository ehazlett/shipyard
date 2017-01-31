import React from "react";

import { Message, Header, Divider, List, Button } from "semantic-ui-react";
import { Redirect } from "react-router-dom";

import Form from "../common/Form";
import { createService, dockerErrorHandler } from "../../api";

const VALIDATION_CONFIG = {
  Image: {
    identifier: "Image",
    rules: [{
      type: "empty",
    }],
  },
  Mode: {
    identifier: "Mode",
    rules: [{
      type: "empty",
      prompt: "Please select a scheduler mode",
    }],
  },
};

export default class CreateServiceForm extends React.Component {
  state = {
    error: null,
    loading: false,
    redirect: false,
    redirectTo: "",
    validationConfig: VALIDATION_CONFIG,
    mountInputKeys: [],
    mountsAdded: 0,
    constraintKeys: [],
    constraintsAdded: 0,
  };

  getMultipleInputFormValues = (namespace, values) => {
    const filterKeys = (obj, predicate) => {
      return Object.keys(obj)
            .filter( key => predicate(key) )
            .reduce( (res, key) => {res[key] = obj[key]; return res}, {});
    };
    const dynamicFormElements = filterKeys(values, key => key.startsWith(namespace + "."));
    const splitDynamicFormElements = Object.keys(dynamicFormElements).map(key => {
      const strippedKey = key.replace(new RegExp("^" + namespace + "\\."), "");
      const split = strippedKey.split("-");
      return [...split, dynamicFormElements[key]];
    });

    // Groups namespaced fields by the row that they are in, and creates an object
    // out of each field.
    const obj = splitDynamicFormElements.reduce((acc, tuple) => {
      const rowTag = tuple[1];
      const key = tuple[0];
      const value = tuple[2];
      const output = {...acc};
      if (output[rowTag] === undefined) {
        output[rowTag] = {};
      }
      output[rowTag][key] = value;
      return output;
    }, {});

    const rows = Object.keys(obj).map(key => obj[key]);
    return rows;
  }

  getMountsFromFormValues = (values) => {
    const mounts = this.getMultipleInputFormValues("Mounts", values);
    return mounts.map(mount => {
      return {
        "Target": mount["Target"],
        "Source": mount["Source"],
        "Type": mount["MountType"],
        "ReadOnly": mount["ReadOnly"] === "true",
        "VolumeOptions": {
          "DriverConfig": {
            "Name": mount["VolumeDriver"]
          },
        },
      };
    });
  }

  getConstraintsFromFormValues = (values) => {
    const constraints = this.getMultipleInputFormValues("Constraints", values);
    return constraints.map(constraint => constraint["PlacementConstraint"]);
  }

  createService = (e, values) => {
    e.preventDefault();
    const mounts = this.getMountsFromFormValues(values);
    const constraints = this.getConstraintsFromFormValues(values);

    createService({
      Name: values.formData.Name,
      TaskTemplate: {
        ContainerSpec: {
          Image: values.formData.Image,
          Args: values.formData.Args ? values.formData.Args.split(" ") : null,
          Command: values.formData.Command ? values.formData.Command.split(" ") : null,
          User: values.formData.User ? values.formData.User : null,
          Dir: values.formData.Dir ? values.formData.Dir : null,
          Groups: values.formData.Command ? values.formData.Command.split(" ") : null,
          TTY: values.formData.TTY,
          OpenStdin: values.formData.OpenStdin,
          Mounts: mounts,
          Placements: constraints,
        },
      },
      Mode: {
        Replicated: {
          Replicas: parseInt(values.formData.Replicas, 10) || 1,
        },
      },
    })
      .then((success) => {
        this.setState({
          error: null,
          loading: false,
          redirect: true,
          redirectTo: `/services/inspect/${success.body.ID}`,
        });
      })
      .catch((error) => {
        dockerErrorHandler(error.response)
          .then((parsedError) => {
            this.setState({
              error: parsedError.desc,
              loading: false
            });
          });
      });
  }

  updateValidationConfig = (key, value) => {
    const validationConfig = Object.assign({}, this.state.validationConfig);

    if(key === "Mode" && value === "Replicated") {
      validationConfig.Replicas = {
        identifier: "Replicas",
        rules: [{
          type: "empty",
        }],
      };
    } else {
      delete validationConfig.Replicas;
    }

    this.setState({
      validationConfig,
    });
  };

  handleChange = (key, value) => {
    this.updateValidationConfig(key, value);
    this.setState({
      [key]: value,
    });
  }

  addMount = () => {
    const key = this.state.mountsAdded;
    const newConfig = {...this.state.validationConfig};
    const emptyValidationMessages = {
      "Mounts.MountType-": "Please select a mount type",
      "Mounts.Source-": "Source is a required field",
      "Mounts.Target-": "Target is a required field",
      "Mounts.VolumeDriver-": "Volume driver is a required field",
      "Mounts.ReadOnly-": "Please indicate whether the mount should be read only",
    };
    Object.keys(emptyValidationMessages).forEach(k => {
      newConfig[k + key] = {
        identifier: k + key,
        rules: [{
          type: "empty",
          prompt: emptyValidationMessages[k],
        }],
      }
    });
    this.setState({
      ...this.state,
      validationConfig: newConfig,
      mountsAdded: key + 1,
      mountInputKeys: [...this.state.mountInputKeys, key]
    })
  }

  removeMount = (e, button) => {
    const key = button.tabIndex;
    const newConfig = {...this.state.validationConfig};
    delete newConfig["Mounts.MountType-" + key];
    delete newConfig["Mounts.Source-" + key];
    delete newConfig["Mounts.Target-" + key];
    delete newConfig["Mounts.VolumeDriver-" + key];
    delete newConfig["Mounts.ReadOnly-" + key];
    this.setState({
      validationConfig: newConfig,
      mountInputKeys: this.state.mountInputKeys.filter((_, i) => i !== key )
    });
  }

  addConstraint = () => {
    const key = this.state.constraintsAdded;
    const newConfig = {...this.state.validationConfig};
    const emptyValidationMessages = {
      "Constraints.PlacementConstraint-": "Placement constraint is a required field",
    };
    Object.keys(emptyValidationMessages).forEach(k => {
      newConfig[k + key] = {
        identifier: k + key,
        rules: [{
          type: "empty",
          prompt: emptyValidationMessages[k],
        }],
      }
    });
    this.setState({
      ...this.state,
      validationConfig: newConfig,
      constraintsAdded: key + 1,
      constraintKeys: [...this.state.constraintKeys, key]
    })
  }

  removeConstraint = (e, button) => {
    const key = button.tabIndex;
    const newConfig = {...this.state.validationConfig};
    delete newConfig["Constraints.PlacementConstraint-" + key];
    this.setState({
      validationConfig: newConfig,
      constraintKeys: this.state.constraintKeys.filter((_, i) => i !== key )
    });
  }

  render() {
    const { redirect, redirectTo, Mode, error } = this.state;
    const mountTypes = [
      { text: "Volume", value: "volume" },
      { text: "Bind", value: "bind" },
    ];
    const readOnlyOptions = [
      { text: "Read Only", value: "true" },
      { text: "Read/Write", value: "false" },
    ];
    const modes = [
      {text:"Replicated", value:"Replicated"},
      {text:"Global", value:"Global"},
    ];
    return (
      <Form inline fields={this.state.validationConfig} onSubmit={this.createService}>
        {redirect && <Redirect to={redirectTo}/>}
        {error && <Message negative>{error}</Message>}
        <Header>Create a Service</Header>
        <Form.Group widths="equal">
          <Form.Input name="Image" label="Image" placeholder="dockercloud/hello-world" required />
          <Form.Input name="Name" label="Service Name" placeholder="hello-world" />
        </Form.Group>

        <Divider hidden />

        <Form.Group widths="equal">
          <Form.Input name="Command" label="Command" placeholder="Default" />
          <Form.Input name="Args" label="Args" placeholder="Default" />
        </Form.Group>

        <Divider hidden />

        <Form.Group widths="equal">
          <Form.Select name="Mode" label="Mode" onChange={(e, data) => this.handleChange(data.name, data.value)} options={modes} placeholder="Mode" required />
          <Form.Input name="Replicas" label="Replicas" type="number" disabled={Mode !== "Replicated"} required={Mode === "Replicated"} placeholder={1} />
        </Form.Group>

        <Divider hidden />

        <Form.Group widths="equal">
          <Form.Input name="User" label="User" placeholder="nobody" />
          <Form.Input name="Dir" label="Working Directory" placeholder="/usr/src/app" />
          <Form.Input name="Groups" label="Groups" placeholder="group1 group2" />
        </Form.Group>

        <Divider />

        <List>
          {this.state.mountInputKeys.map((key, i) => {
            return (
              <List.Item key={key}>
                <Form.Group widths="equal">
                  <Form.Select name={"Mounts.MountType-" + i} label={i === 0 && "Type"} options={mountTypes} placeholder="Type" required />
                  <Form.Input name={"Mounts.Source-" + i} label={i === 0 && "Source"} placeholder="volumename or /host/path" required />
                  <Form.Input name={"Mounts.Target-" + i} label={i === 0 && "Target"} placeholder="/container/path" required />
                  <Form.Input name={"Mounts.VolumeDriver-" + i} label={i === 0 && "Volume Driver"} placeholder="local" required />
                  <Form.Select name={"Mounts.ReadOnly-" + i} label={i === 0 && "Read Only"} options={readOnlyOptions} placeholder="Read Only" required />
                  <Form.Button type="button" tabIndex={i} width={4} icon="minus" label={i === 0 && "Remove"} basic onClick={this.removeMount}/>
                </Form.Group>
              </List.Item>
            );
          })}
        </List>
        <Button content="Mount" type="button" icon="plus" basic onClick={this.addMount}/>

        <Divider />

        <List>
          {this.state.constraintKeys.map((key, i) => {
            return (
              <List.Item key={key}>
                <Form.Group widths="equal">
                  <Form.Input name={"Constraints.PlacementConstraint-" + i} label={i === 0 && "Placement Constraint"} placeholder="node.labels.type == queue" required />
                  <Form.Button type="button" tabIndex={i} icon="minus" label={i === 0 && "Remove"} basic onClick={this.removeConstraint}/>
                </Form.Group>
              </List.Item>
            );
          })}
        </List>
        <Button content="Constraint" type="button" icon="plus" basic onClick={this.addConstraint}/>

        <Divider />

        {/* These don"t seem to do anything at the moment
        <Form.Field>
          <label>Stream Options</label>
          <Form.Group inline>
            <Form.Checkbox label="Attach TTY" name="TTY" />
            <Form.Checkbox label="Open stdin" name="OpenStdin" />
          </Form.Group>
        </Form.Field>
        */}

        <Divider hidden />
        <Form.Button color="green">Create Service</Form.Button>
      </Form>
    );
  }
}
