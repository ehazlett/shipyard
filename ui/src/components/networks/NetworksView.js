import React from 'react';

import { Route, Switch, Redirect } from "react-router-dom";

import NetworkListView from './NetworkListView';
import NetworkInspectView from './NetworkInspectView';

class NetworksView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/networks" component={NetworkListView} />
        <Route exact path="/networks/inspect/:id" component={NetworkInspectView} />
        <Route render={() => <Redirect to="/networks" />} />
      </Switch>
    );
  }
}

export default NetworksView;
