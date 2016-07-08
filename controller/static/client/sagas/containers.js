import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { listContainers } from '../api/containers.js';

export function* containersFetch() {
  try {
    const containers = yield call(listContainers);
    yield put({
      type: 'CONTAINERS_FETCH_SUCCEEDED',
      containers,
    });
  } catch (e) {
    yield put({ type: 'CONTAINERS_FETCH_FAILED', error: e.message });
  }
}


function* watchContainersFetch() {
  yield* takeLatest('CONTAINERS_FETCH_REQUESTED', containersFetch);
}

export default function* watchers() {
  yield [
    watchContainersFetch(),
  ];
}
