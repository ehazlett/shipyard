import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { push } from 'react-router-redux'

import { getInfo } from '../api/info.js';

function* watchInfoFetch() {
  yield* takeLatest("INFO_FETCH_REQUESTED", infoFetch);
}

export function* infoFetch(action) {
  try {
    const info = yield call(getInfo);
    yield put({
      type: "INFO_FETCH_SUCCEEDED",
      info: info,
    });
  } catch (e) {
    yield put({type: "INFO_FETCH_FAILED", message: e.message});
  }
}

export default function* watchers() {
  yield [
    watchInfoFetch()
  ];
}
