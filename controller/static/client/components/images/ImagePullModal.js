import React from 'react';

var PullImageModal = React.createClass({
  pullImage() {
    this.props.pullImage(this.refs.imageName.value)
  },
  render: function() {
    return (
      <form className={(this.props.visible) ? 'ui small modal transition visible active form' : 'ui small modal transition hidden'} onSubmit={this.pullImage}>
        <div className="ui header">Pull a Image</div>
        <div className="content">
          <div className="field">
            <label>Image Name</label>
            <input ref="imageName" type="text"></input>
          </div>
        </div>
        <div className="actions">
          <div className="ui negative button" onClick={this.props.hideModal}>
            Cancel
          </div>
          <input type="submit" className="ui positive button" value="Pull Image"></input>
        </div>
      </form>
    );
  }
});

export default PullImageModal;
