import React from 'react';

import { Match } from 'react-router';

import { ContainerListView } from './ContainerListView';
import { ContainerInspectView } from './ContainerInspectView';

class ContainersView extends React.Component {
  render() {
    return (
      <div>
        Hi
        <Match exactly pattern="/containers/inspect/:id" component={ContainerInspectView} />
        {/*
        <Match pattern="/" component={ContainerListView} />
        */}
      </div>
    );
  }
}

export default ContainersView;
