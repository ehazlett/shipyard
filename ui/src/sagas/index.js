import { call, fork } from 'redux-saga/effects';

// Watchers
import userWatchers from './user';
import infoWatchers from './info';
import servicesWatchers from './services';
import nodesWatchers from './nodes';
import imagesWatchers from './images';
import networksWatchers from './networks';
import volumesWatchers from './volumes';
import containersWatchers from './containers';
import eventsWatchers from './events';
import accountsWatchers from './accounts';
import swarmWatchers, { swarmFetch } from './swarm';

import { getAuthToken } from '../services/auth';

function* watchers() {
  yield [
    fork(swarmWatchers),
    fork(userWatchers),
    fork(infoWatchers),
    fork(servicesWatchers),
    fork(nodesWatchers),
    fork(imagesWatchers),
    fork(networksWatchers),
    fork(volumesWatchers),
    fork(containersWatchers),
    fork(eventsWatchers),
    fork(accountsWatchers),
  ];
}

function* init() {
  if (getAuthToken()) {
    yield call(swarmFetch);
  }
}

export default function registerWatchers(sagaMiddleware) {
  sagaMiddleware.run(watchers);
  sagaMiddleware.run(init);
}
