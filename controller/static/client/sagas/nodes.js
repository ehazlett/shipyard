import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { listNodes } from '../api/nodes.js';

export function* nodesFetch() {
  try {
    const nodes = yield call(listNodes);
    yield put({
      type: 'NODES_FETCH_SUCCEEDED',
      nodes,
    });
  } catch (e) {
    yield put({ type: 'NODES_FETCH_FAILED', error: e.message });
  }
}

function* watchNodesFetch() {
  yield* takeLatest('NODES_FETCH_REQUESTED', nodesFetch);
}

export default function* watchers() {
  yield [
    watchNodesFetch(),
  ];
}
