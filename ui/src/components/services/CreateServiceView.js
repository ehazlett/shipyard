import React from 'react';

import { Segment } from 'semantic-ui-react';

import CreateServiceForm from './CreateServiceForm';

const CreateServiceView = (props) => (
  <Segment basic>
    <CreateServiceForm {...props} />
  </Segment>
);

export default CreateServiceView;
