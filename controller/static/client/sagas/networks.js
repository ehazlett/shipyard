import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import { listNetworks } from '../api/networks.js';

function* watchNetworksFetch() {
  yield* takeLatest('NETWORKS_FETCH_REQUESTED', networksFetch);
}

export function* networksFetch(action) {
  try {
    const networks = yield call(listNetworks);
    yield put({
      type: 'NETWORKS_FETCH_SUCCEEDED',
      networks,
    });
  } catch (e) {
    yield put({ type: 'NETWORKS_FETCH_FAILED', message: e.message });
  }
}

export default function* watchers() {
  yield [
    watchNetworksFetch(),
  ];
}
