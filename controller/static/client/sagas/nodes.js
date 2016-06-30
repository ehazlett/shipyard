import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import { listNodes } from '../api/nodes.js';

function* watchNodesFetch() {
  yield* takeLatest('NODES_FETCH_REQUESTED', nodesFetch);
}

export function* nodesFetch(action) {
  try {
    const nodes = yield call(listNodes);
    yield put({
      type: 'NODES_FETCH_SUCCEEDED',
      nodes,
    });
  } catch (e) {
    yield put({ type: 'NODES_FETCH_FAILED', message: e.message });
  }
}

export default function* watchers() {
  yield [
    watchNodesFetch(),
  ];
}
