import { takeLatest, takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { removeAuthToken } from '../services/auth';
import { updateSwarm, getSwarm, initSwarm } from '../api/swarm.js';

function* swarmInit(action) {
  try {
    yield call(initSwarm, action.spec);
    yield put({
      type: 'SWARM_INIT_SUCCEEDED',
      message: 'Successfully initialized swarm',
      level: 'success',
    });
  } catch (e) {
    yield put({
      type: 'SWARM_INIT_FAILED',
      message: e.json.message,
      level: 'error',
    });
  }
}

function* watchSwarmInit() {
  yield* takeLatest('SWARM_INIT_REQUESTED', swarmInit);
}

export function* swarmFetch() {
  try {
    const swarm = yield call(getSwarm);
    yield put({
      type: 'SWARM_FETCH_SUCCEEDED',
      swarm,
    });
  } catch (e) {
    // If we receive a 406 when fetching swarm info, this means the cluster is not initialised
    if (e.response.status === 406) {
      yield put({
        type: 'SWARM_NOT_INITIALIZED',
        //message: e.json.message, -- It's not necessary to capture the swarm not initialised message yet
        level: 'error',
      });
    } else if (e.response.status === 401) {
      // FIXME: Temporary hack to handle not being able to detect whether a token is expired/invalid
      removeAuthToken();
    } else {
      yield put({
        type: 'SWARM_FETCH_FAILED',
        message: e.json.message,
        level: 'error',
      });
    }
  }
}

function* watchSwarmFetch() {
  yield* takeLatest('SWARM_FETCH_REQUESTED', swarmFetch);
}

function* watchSwarmInitSucceeded() {
  yield* takeLatest('SWARM_INIT_SUCCEEDED', swarmFetch);
}

export function* updateSwarmSettings(action) {
  try {
    yield call(updateSwarm, action.spec, action.version, action.rotateManagerToken, action.rotateWorkerToken);

    // Signal that update succeeded
    yield put({
      type: 'SWARM_UPDATE_SETTINGS_SUCCEEDED',
      message: 'Successfully updated swarm settings',
      level: 'success',
    });

    yield call(swarmFetch);
  } catch (e) {
		yield put({
			type: 'SWARM_UPDATE_SETTINGS_FAILED',
      message: e.json.message,
      level: 'error',
    });
  }
}

function* watchUpdateSwarmSettings() {
  yield* takeEvery('SWARM_UPDATE_SETTINGS_REQUESTED', updateSwarmSettings);
}

export default function* watchers() {
  yield [
    watchSwarmFetch(),
    watchSwarmInit(),
    watchSwarmInitSucceeded(),
    watchUpdateSwarmSettings(),
  ];
}
