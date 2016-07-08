import React from 'react';

import CreateVolumeForm from './CreateVolumeForm';

const CreateVolumeView = React.createClass({
  render() {
    return (
      <CreateVolumeForm {...this.props} />
    );
  },
});

export default CreateVolumeView;
