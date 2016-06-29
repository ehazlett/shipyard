import React from 'react';

const ContainerInspect = React.createClass({
  render() {
    const {container} = this.props;
    return (
      <div className="ui basic segment">
        <div className="ui relaxed large horizontal list">
          <div className="item">
            <div className="header">ID</div>
            { container.Id.substring(0, 12) }
          </div>
        </div>
      </div>
    );
  }
});

export default ContainerInspect;
