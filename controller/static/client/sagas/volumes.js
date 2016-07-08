import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { listVolumes, createVolume } from '../api/volumes.js';

function* createVolumeSaga(action) {
  try {
    yield call(createVolume, action.volume);
    yield put({
      type: 'CREATE_VOLUME_SUCCEEDED',
    });
    yield put({ type: 'VOLUMES_FETCH_REQUESTED' });
    yield put({ type: 'HIDE_MODAL' });
  } catch (e) {
    yield put({ type: 'CREATE_VOLUME_FAILED', error: e.message });
  }
}

function* watchCreateVolume() {
  yield* takeLatest('CREATE_VOLUME_REQUESTED', createVolumeSaga);
}

export function* volumesFetch() {
  try {
    const volumes = yield call(listVolumes);
    yield put({
      type: 'VOLUMES_FETCH_SUCCEEDED',
      volumes,
    });
  } catch (e) {
    yield put({ type: 'VOLUMES_FETCH_FAILED', error: e.message });
  }
}

function* watchVolumesFetch() {
  yield* takeLatest('VOLUMES_FETCH_REQUESTED', volumesFetch);
}

export default function* watchers() {
  yield [
    watchVolumesFetch(),
    watchCreateVolume(),
  ];
}
