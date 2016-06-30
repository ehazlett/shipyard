import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import user from './user';
import modals from './modals';
import info from './info';
import swarm from './swarm';
import services from './services';
import tasks from './tasks';
import nodes from './nodes';
import images from './images';
import networks from './networks';
import volumes from './volumes';
import events from './events';
import containers from './containers';

const rootReducer = combineReducers({
  user,
  containers,
  events,
  modals,
  info,
  swarm,
  services,
  tasks,
  nodes,
  images,
  networks,
  volumes,
  routing: routerReducer,
});

export default rootReducer;
