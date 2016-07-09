import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import error from './error';
import user from './user';
import info from './info';
import swarm from './swarm';
import services from './services';
import tasks from './tasks';
import nodes from './nodes';
import images from './images';
import networks from './networks';
import accounts from './accounts';
import volumes from './volumes';
import events from './events';
import containers from './containers';

const rootReducer = combineReducers({
  error,
  user,
  containers,
  events,
  info,
  swarm,
  services,
  tasks,
  nodes,
  images,
  networks,
  accounts,
  volumes,
  routing: routerReducer,
});

export default rootReducer;
