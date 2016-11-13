import React, { PropTypes } from 'react';

const ContainerInspect = ({ container }) => (
  <div className="ui basic segment">
    <div className="ui relaxed large horizontal list">
      <div className="item">
        <div className="header">ID</div>
        {container.Id.substring(0, 12)}
      </div>
    </div>
  </div>
);

ContainerInspect.propTypes = {
  container: PropTypes.object.isRequired,
};

export default ContainerInspect;
