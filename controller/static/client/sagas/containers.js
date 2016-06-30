import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { listContainers } from '../api/containers.js';

function* watchContainersFetch() {
  yield* takeLatest('CONTAINERS_FETCH_REQUESTED', containersFetch);
}

export function* containersFetch(action) {
  try {
    const containers = yield call(listContainers);
    yield put({
      type: 'CONTAINERS_FETCH_SUCCEEDED',
      containers,
    });
  } catch (e) {
    yield put({ type: 'CONTAINERS_FETCH_FAILED', message: e.message });
  }
}

export default function* watchers() {
  yield [
    watchContainersFetch(),
  ];
}
