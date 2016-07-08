import React from 'react';

import CreateServiceForm from './CreateServiceForm';

const CreateServiceView = React.createClass({
  render() {
    return (
      <CreateServiceForm {...this.props} />
    );
  },
});

export default CreateServiceView;
