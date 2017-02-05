import React from 'react';

import { Route, Switch, Redirect } from "react-router-dom";

import CreateAccountView from './CreateAccountView';
import AccountListView from './AccountListView';
import AccountInspectView from './AccountInspectView';

class AccountsView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/accounts" component={AccountListView} />
        <Route exact path="/accounts/inspect/:id" component={AccountInspectView} />
        <Route exact path="/accounts/create" component={CreateAccountView} />
        <Route render={() => <Redirect to="/accounts" />} />
      </Switch>
    );
  }
}

export default AccountsView;
