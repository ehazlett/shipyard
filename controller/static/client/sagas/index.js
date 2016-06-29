import { call, put, fork } from 'redux-saga/effects';

// Watchers
import userWatchers from './user.js';
import infoWatchers, {infoFetch} from './info.js';
import servicesWatchers, {servicesFetch} from './services.js';
import nodesWatchers, {nodesFetch} from './nodes.js';
import imagesWatchers, {imagesFetch} from './images.js';
import networksWatchers, {networksFetch} from './networks.js';
import volumesWatchers, {volumesFetch} from './volumes.js';
import containersWatchers, {containersFetch} from './containers.js';
import eventsWatchers from './events.js';
import swarmWatchers, {swarmFetch} from './swarm.js';

function* init() {
  yield fork(swarmWatchers);
  yield call(swarmFetch);
}

function* preloadData() {
  yield [
    fork(servicesFetch),
    fork(containersFetch),
    fork(imagesFetch),
    fork(nodesFetch),
    fork(networksFetch),
    fork(volumesFetch),
    fork(infoFetch)
  ]
}

function* watchers() {
  yield [
    fork(userWatchers),
    fork(infoWatchers),
    fork(servicesWatchers),
    fork(nodesWatchers),
    fork(imagesWatchers),
    fork(networksWatchers),
    fork(volumesWatchers),
    fork(containersWatchers),
    fork(eventsWatchers),
  ];
}

export default function registerWatchers(sagaMiddleware) {
  //sagaMiddleware.run(init);
  //sagaMiddleware.run(preloadData);
  sagaMiddleware.run(watchers);
}
