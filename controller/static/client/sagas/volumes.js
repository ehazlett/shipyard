import { takeLatest } from 'redux-saga';
import { take, call, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';

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
    yield put({ type: 'CREATE_VOLUME_FAILED', message: e.message, messageLevel: 'error' });
  }
}

function* watchCreateVolume() {
  yield* takeLatest('CREATE_VOLUME_REQUESTED', createVolumeSaga);
}

// Upon successfully creating a volume, navigate to the volumes page
function* watchCreateVolumeSucceeded() {
  while (true) {
    yield take('CREATE_VOLUME_SUCCEEDED');
    yield put(push('/volumes'));
  }
}

export function* volumesFetch() {
  try {
    const volumes = yield call(listVolumes);
    yield put({
      type: 'VOLUMES_FETCH_SUCCEEDED',
      volumes,
    });
  } catch (e) {
    yield put({ type: 'VOLUMES_FETCH_FAILED', message: e.message, messageLevel: 'error' });
  }
}

function* watchVolumesFetch() {
  yield* takeLatest('VOLUMES_FETCH_REQUESTED', volumesFetch);
}

export default function* watchers() {
  yield [
    watchVolumesFetch(),
    watchCreateVolume(),
    watchCreateVolumeSucceeded(),
  ];
}
