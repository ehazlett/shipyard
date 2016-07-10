import { takeLatest, takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import {
  listImages,
  pullImage,
  removeImage,
} from '../api/images.js';

function* imagePull(action) {
  try {
    yield call(pullImage, action.imageName);
    yield put({ type: 'IMAGE_PULL_SUCCEEDED' });
  } catch (e) {
    yield put({ type: 'IMAGE_PULL_FAILED', message: e.message, messageLevel: 'error' });
  }
}

function* watchImagesPull() {
  yield* takeEvery('IMAGE_PULL_REQUESTED', imagePull);
}

export function* imagesFetch(action) {
  try {
    const images = yield call(listImages, action.all);
    yield put({
      type: 'IMAGES_FETCH_SUCCEEDED',
      images,
    });
  } catch (e) {
    yield put({ type: 'IMAGES_FETCH_FAILED', message: e.message, messageLevel: 'error' });
  }
}

function* watchImagesFetch() {
  yield* takeLatest('IMAGES_FETCH_REQUESTED', imagesFetch);
}

export function* imageRemove(action) {
  try {
    yield call(removeImage, action.id, action.volumes, action.force);

    // Signal that remove succeeded
    yield put({
      type: 'IMAGE_REMOVE_SUCCEEDED',
      id: action.id,
      message: `Successfully removed image ${action.id}`,
      messageLevel: 'success',
    });

    // Refresh after removing a image
    yield call(imagesFetch, { all: false });
  } catch (e) {
    yield put({ type: 'IMAGE_REMOVE_FAILED', message: e.message, messageLevel: 'error' });
  }
}

function* watchImageRemove() {
  yield* takeEvery('IMAGE_REMOVE_REQUESTED', imageRemove);
}

export default function* watchers() {
  yield [
    watchImagesFetch(),
    watchImagesPull(),
    watchImageRemove(),
  ];
}
