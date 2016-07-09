import React from 'react';

import { Route, IndexRoute } from 'react-router';

import App from './containers/App';
import ServiceListView from './components/services/ServiceListView';
import CreateServiceView from './components/services/CreateServiceView';
import ServiceInspectView from './components/services/ServiceInspectView';
import TaskInspectView from './components/services/TaskInspectView';
import ContainerListView from './components/containers/ContainerListView';
import ContainerInspectView from './components/containers/ContainerInspectView';
import NodeListView from './components/nodes/NodeListView';
import NodeInspectView from './components/nodes/NodeInspectView';
import ImageListView from './components/images/ImageListView';
import NetworkListView from './components/networks/NetworkListView';
import VolumeListView from './components/volumes/VolumeListView';
import CreateVolumeView from './components/volumes/CreateVolumeView';
import AccountListView from './components/accounts/AccountListView';
import SettingsView from './components/settings/SettingsView';
import EventListView from './components/events/EventListView';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={ServiceListView} />
    <Route path="/services" component={ServiceListView} />
    <Route path="/services/create" component={CreateServiceView} />
    <Route path="/services/:id" component={ServiceInspectView} />
    <Route path="/services/:serviceId/tasks/:id" component={TaskInspectView} />
    <Route path="/nodes" component={NodeListView} />
    <Route path="/nodes/:id" component={NodeInspectView} />
    <Route path="/networks" component={NetworkListView} />
    <Route path="/volumes" component={VolumeListView} />
    <Route path="/volumes/create" component={CreateVolumeView} />
    <Route path="/settings" component={SettingsView} />
    <Route path="/containers" component={ContainerListView} />
    <Route path="/containers/:id" component={ContainerInspectView} />
    <Route path="/accounts" component={AccountListView} />
    <Route path="/images" component={ImageListView} />
    <Route path="/events" component={EventListView} />
  </Route>
);
