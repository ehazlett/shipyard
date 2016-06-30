import { takeEvery, takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import { listVolumes, createVolume } from '../api/volumes.js';

function* watchCreateVolume() {
  yield* takeLatest('CREATE_VOLUME_REQUESTED', createVolumeSaga);
}

function* createVolumeSaga(action) {
  try {
    yield call(createVolume, action.volume);
    yield put({
      type: 'CREATE_VOLUME_SUCCEEDED',
    });
    yield put({ type: 'VOLUMES_FETCH_REQUESTED' });
    yield put({ type: 'HIDE_MODAL' });
  } catch (e) {
    yield put({ type: 'CREATE_VOLUME_FAILED', message: e.message });
  }
}

function* watchVolumesFetch() {
  yield* takeLatest('VOLUMES_FETCH_REQUESTED', volumesFetch);
}

export function* volumesFetch(action) {
  try {
    const volumes = yield call(listVolumes);
    yield put({
      type: 'VOLUMES_FETCH_SUCCEEDED',
      volumes,
    });
  } catch (e) {
    yield put({ type: 'VOLUMES_FETCH_FAILED', message: e.message });
  }
}

export default function* watchers() {
  yield [
    watchVolumesFetch(),
    watchCreateVolume(),
  ];
}
