import React from 'react';

import { Route, Switch, Redirect } from "react-router-dom";

import NodeListView from './NodeListView';
import NodeInspectView from './NodeInspectView';

class NodesView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/nodes" component={NodeListView} />
        <Route exact path="/nodes/inspect/:id" component={NodeInspectView} />
        <Route render={() => <Redirect to="/nodes" />} />
      </Switch>
    );
  }
}

export default NodesView;
