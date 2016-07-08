import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { getInfo } from '../api/info.js';

export function* infoFetch() {
  try {
    const info = yield call(getInfo);
    yield put({
      type: 'INFO_FETCH_SUCCEEDED',
      info,
    });
  } catch (e) {
    yield put({ type: 'INFO_FETCH_FAILED', error: e.message });
  }
}

function* watchInfoFetch() {
  yield* takeLatest('INFO_FETCH_REQUESTED', infoFetch);
}

export default function* watchers() {
  yield [
    watchInfoFetch(),
  ];
}
