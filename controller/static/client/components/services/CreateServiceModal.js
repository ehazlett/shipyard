import React from 'react';

var CreateServiceModal = React.createClass({
  createService() {
    this.props.createService({
      Name: this.refs.name.value,
      TaskTemplate: {
        ContainerSpec: {
          Image: this.refs.image.value
        }
      }
    })
  },
  render: function() {
    return (
      <form className={(this.props.visible) ? 'ui small modal transition visible active form' : 'ui small modal transition hidden'} onSubmit={this.createService}>
        <div className="ui header">Create a Service</div>
        <div className="content">
          <div className="field">
            <label>Name</label>
            <input ref="name" type="text"></input>
          </div>
          <div className="field">
            <label>Image</label>
            <input ref="image" type="text"></input>
          </div>
        </div>
        <div className="actions">
          <div className="ui negative button" onClick={this.props.hideModal}>
            Cancel
          </div>
          <input type="submit" className="ui positive button" value="Create Service"></input>
        </div>
      </form>
    );
  }
});

export default CreateServiceModal;
