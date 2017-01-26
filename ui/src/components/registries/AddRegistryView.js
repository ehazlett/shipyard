import React from 'react';

import { Segment } from 'semantic-ui-react';

import AddRegistryForm from './AddRegistryForm';

const AddRegistryView = (props) => (
  <Segment basic>
    <AddRegistryForm {...props} />
  </Segment>
);

export default AddRegistryView;
