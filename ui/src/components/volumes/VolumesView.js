import React from 'react';

import { Route, Switch, Redirect } from "react-router-dom";

import VolumeListView from './VolumeListView';
import VolumeInspectView from './VolumeInspectView';
import CreateVolumeView from "./CreateVolumeView";

class VolumesView extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/volumes" component={VolumeListView} />
        <Route exact path="/volumes/inspect/:id" component={VolumeInspectView} />
        <Route exact path="/volumes/create" component={CreateVolumeView} />
        <Route render={() => <Redirect to="/volumes" />} />
      </Switch>
    );
  }
}

export default VolumesView;
