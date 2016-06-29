import { fork } from 'redux-saga/effects';

// Watchers
import userWatchers from './user.js';
import infoWatchers from './info.js';
import servicesWatchers from './services.js';
import nodesWatchers from './nodes.js';
import imagesWatchers from './images.js';
import networksWatchers from './networks.js';
import volumesWatchers from './volumes.js';
import containersWatchers from './containers.js';
import eventsWatchers from './events.js';
import swarmWatchers from './swarm.js';

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
  ];
}

export default function registerWatchers(sagaMiddleware) {
  sagaMiddleware.run(watchers);
}
