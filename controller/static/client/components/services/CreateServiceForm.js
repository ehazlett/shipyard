import React, { PropTypes } from 'react';

import { Header, Field } from 'react-semantify';

class CreateServiceForm extends React.Component {

  constructor(props) {
    super(props);

    this.createService = this.createService.bind(this);
  }

  createService(e) {
    this.props.createService({
      Name: this.refs.name.value,
      TaskTemplate: {
        ContainerSpec: {
          Image: this.refs.image.value,
          Command: this.refs.command.value.split(' '),
        },
      },
      Mode: {
        Replicated: {
          Replicas: parseInt(this.refs.replicas.value, 10) || 1,
        },
      },
    });
    e.preventDefault();
  }

  render() {
    return (
      <form className="ui form" onSubmit={this.createService}>
        <Header className="ui header">Create a Service</Header>
        <Field>
          <label>Name</label>
          <input ref="name" type="text"></input>
        </Field>
        <Field>
          <label>Image</label>
          <input ref="image" type="text"></input>
        </Field>
        <Field>
          <label>Command</label>
          <input ref="command" type="text"></input>
        </Field>
        <Field>
          <label>Replicas</label>
          <input ref="replicas" type="number" placeholder="1"></input>
        </Field>
        <input type="submit" className="ui positive button" value="Create Service"></input>
      </form>
    );
  }
}

CreateServiceForm.propTypes = {
  createService: PropTypes.func.isRequired,
};

export default CreateServiceForm;
