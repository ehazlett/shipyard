import React from 'react';

import { Route, Switch, Redirect } from "react-router-dom";

import SecretListView from './SecretListView';
import SecretInspectView from './SecretInspectView';

class SecretsView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/secrets" component={SecretListView} />
        <Route exact path="/secrets/inspect/:id" component={SecretInspectView} />
        <Route render={() => <Redirect to="/secrets" />} />
      </Switch>
    );
  }
}

export default SecretsView;
