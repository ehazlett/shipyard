import React from 'react';

import { Route, Switch, Redirect } from "react-router-dom";

import ContainerListView from './ContainerListView';
import ContainerInspectView from './ContainerInspectView';

class ContainersView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/containers" component={ContainerListView} />
        <Route exact path="/containers/inspect/:id" component={ContainerInspectView} />
        <Route render={() => <Redirect to="/containers" />} />
      </Switch>
    );
  }
}

export default ContainersView;
