import React from 'react';

var CreateVolumeModal = React.createClass({
  createVolume() {
    const driverOpts = {};

    if (this.refs.DriverOpts.value !== '') {
      var opts = this.refs.DriverOpts.value.split(' ');
      _.forEach(opts, function (o) {
        var opt = o[i].split('=');
        driverOpts[opt[0]] = opt[1];
      });
    }

    this.props.createVolume({
      Name: this.refs.Name.value,
      Driver: this.refs.Driver.value,
      DriverOpts: driverOpts,
    });
  },
  render() {
    return (
      <form className={(this.props.visible) ? 'ui small modal transition visible active form' : 'ui small modal transition hidden'} onSubmit={this.createVolume}>
        <div className="ui header">Create a Volume</div>
        <div className="content">
          <div className="field">
            <label>Name</label>
            <input ref="Name" type="text" placeholder="volume-name"></input>
          </div>
          <div className="field">
            <label>Driver</label>
            <input ref="Driver" type="text" placeholder="local" default="local"></input>
          </div>
          <div className="field">
            <label>Driver Options</label>
            <input ref="DriverOpts" type="text" placeholder="e.g. key1=value1 key2=value2"></input>
          </div>
        </div>
        <div className="actions">
          <div className="ui negative button" onClick={this.props.hideModal}>
            Cancel
          </div>
          <input type="submit" className="ui positive button" value="Create Volume"></input>
        </div>
      </form>
    );
  },
});

export default CreateVolumeModal;
