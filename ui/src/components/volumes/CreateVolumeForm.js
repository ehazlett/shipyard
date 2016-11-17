import React, { PropTypes } from 'react';

import _ from 'lodash';
import { Header, Field } from 'semantic-ui-react';

class CreateVolumeForm extends React.Component {
  constructor(props) {
    super(props);

    this.createVolume = this.createVolume.bind(this);
  }

  createVolume(e) {
    const driverOpts = {};

    if (this.refs.DriverOpts.value !== '') {
      const opts = this.refs.DriverOpts.value.split(' ');
      _.forEach(opts, (o) => {
        const opt = o.split('=');
        driverOpts[opt[0]] = opt[1];
      });
    }

    this.props.createVolume({
      Name: this.refs.Name.value,
      Driver: this.refs.Driver.value,
      DriverOpts: driverOpts,
    });

    e.preventDefault();
  }

  render() {
    return (
      <form className="ui form" onSubmit={this.createVolume}>
        <Header>Create a Volume</Header>
        <Field>
          <label>Name</label>
          <input ref="Name" type="text" placeholder="volume-name"></input>
        </Field>
        <Field>
          <label>Driver</label>
          <input ref="Driver" type="text" placeholder="local" default="local"></input>
        </Field>
        <Field>
          <label>Driver Options</label>
          <input ref="DriverOpts" type="text" placeholder="e.g. key1=value1 key2=value2"></input>
        </Field>
        <input type="submit" className="ui positive button" value="Create Volume"></input>
      </form>
    );
  }
}

CreateVolumeForm.propTypes = {
  createVolume: PropTypes.func.isRequired,
};

export default CreateVolumeForm;
