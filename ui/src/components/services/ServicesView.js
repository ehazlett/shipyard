import React from 'react';

import { Route, Switch, Redirect }  from "react-router-dom";

import ServiceListView from './ServiceListView';
import ServiceInspectView from './ServiceInspectView';
import CreateServiceView from "./CreateServiceView";
import ServiceInspectTaskView from "./ServiceInspectTaskView";

class ServicesView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/services" component={ServiceListView} />
        <Route exact path="/services/create" component={CreateServiceView} />
        <Route exact path="/services/inspect/:id" component={ServiceInspectView} />
        <Route exact path="/services/inspect/:serviceId/container/:id" component={ServiceInspectTaskView} />
				<Route render={() => <Redirect to="/services" />} />
      </Switch>
    );
  }
}

export default ServicesView;
