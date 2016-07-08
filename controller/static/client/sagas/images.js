import { takeLatest, takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { listImages, pullImage } from '../api/images.js';

function* imagePull(action) {
  try {
    yield call(pullImage, action.imageName);
    yield put({ type: 'IMAGE_PULL_SUCCEEDED' });
  } catch (e) {
    yield put({ type: 'IMAGE_PULL_FAILED', error: e.message });
  }
}

function* watchImagesPull() {
  yield* takeEvery('IMAGE_PULL_REQUESTED', imagePull);
}

export function* imagesFetch() {
  try {
    const images = yield call(listImages);
    yield put({
      type: 'IMAGES_FETCH_SUCCEEDED',
      images,
    });
  } catch (e) {
    yield put({ type: 'IMAGES_FETCH_FAILED', error: e.message });
  }
}

function* watchImagesFetch() {
  yield* takeLatest('IMAGES_FETCH_REQUESTED', imagesFetch);
}

export default function* watchers() {
  yield [
    watchImagesFetch(),
    watchImagesPull(),
  ];
}
