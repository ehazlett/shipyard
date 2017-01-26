import React from 'react';

import { Segment } from 'semantic-ui-react';

import CreateVolumeForm from './CreateVolumeForm';

const CreateVolumeView = (props) => (
  <Segment basic>
    <CreateVolumeForm {...props} />
  </Segment>
);

export default CreateVolumeView;
