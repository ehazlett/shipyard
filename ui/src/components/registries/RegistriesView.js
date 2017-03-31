import React from "react";

import { Route, Switch, Redirect } from "react-router-dom";

import RegistryListView from "./RegistryListView";
import RegistryInspectView from "./RegistryInspectView";
import AddRegistryView from "./AddRegistryView";

class RegistriesView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/registries" component={RegistryListView} />
        <Route
          exact
          path="/registries/inspect/:id"
          component={RegistryInspectView}
        />
        <Route exact path="/registries/add" component={AddRegistryView} />
        <Route render={() => <Redirect to="/registries" />} />
      </Switch>
    );
  }
}

export default RegistriesView;
