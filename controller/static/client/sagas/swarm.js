import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { getSwarm, initSwarm } from '../api/swarm.js';

function* swarmInit() {
  try {
    yield call(initSwarm);
		yield put({
			type: 'SWARM_INIT_SUCCEEDED',
      message: `Successfully initialized swarm`,
      level: 'success',
		});
  } catch (e) {
		yield put({
			type: 'SWARM_INIT_FAILED',
			message: e.message,
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
    if (!e.response) {
      console.error('Error does not contain a response', e);
      return;
    }

    // If we receive a 406 when fetching swarm info, this means the cluster is not initialised
    if (e.response.status === 406) {
			yield put({
				type: 'SWARM_NOT_INITIALIZED',
				message: e.message,
				level: 'error',
			});
    } else {
			yield put({
				type: 'SWARM_FETCH_FAILED',
				message: e.message,
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

export default function* watchers() {
  yield [
    watchSwarmFetch(),
    watchSwarmInit(),
    watchSwarmInitSucceeded(),
  ];
}
