import React from 'react';

import { render } from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import { Provider } from 'react-redux';

import semanticCss from '../node_modules/semantic-ui-css/semantic.css';
import semanticJs from '../node_modules/semantic-ui-css/semantic.js';

import App from './components/App';
import SwarmInitView from './components/swarm/SwarmInitView';
import ServiceListView from './components/services/ServiceListView';
import ServiceInspectView from './components/services/ServiceInspectView';
import TaskInspectView from './components/services/TaskInspectView';
import ContainerListView from './components/containers/ContainerListView';
import ContainerInspectView from './components/containers/ContainerInspectView';
import NodeListView from './components/nodes/NodeListView';
import NodeInspectView from './components/nodes/NodeInspectView';
import ImageListView from './components/images/ImageListView';
import NetworkListView from './components/networks/NetworkListView';
import VolumeListView from './components/volumes/VolumeListView';
import SettingsView from './components/settings/SettingsView';
import EventsView from './components/events/EventsView';

import store, { history } from './store';

const router = (
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={ServiceListView}></IndexRoute>
        <Route path="/services" component={ServiceListView}></Route>
        <Route path="/services/:id" component={ServiceInspectView}></Route>
        <Route path="/services/:serviceId/tasks/:id" component={TaskInspectView}></Route>
        <Route path="/nodes" component={NodeListView}></Route>
        <Route path="/nodes/:id" component={NodeInspectView}></Route>
        <Route path="/networks" component={NetworkListView}></Route>
        <Route path="/volumes" component={VolumeListView}></Route>
        <Route path="/settings" component={SettingsView}></Route>
        <Route path="/containers" component={ContainerListView}></Route>
        <Route path="/containers/:id" component={ContainerInspectView}></Route>
        <Route path="/images" component={ImageListView}></Route>
        <Route path="/events" component={EventsView}></Route>
      </Route>
    </Router>
  </Provider>
);

render(router, document.getElementById('root'));
