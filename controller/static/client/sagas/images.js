import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { listImages, pullImage } from '../api/images.js';

function* watchImagesPull() {
  yield* takeEvery("IMAGE_PULL_REQUESTED", imagePull);
}

function* imagePull(action) {
  try {
    yield call(pullImage, action.imageName);
    yield put({type: "IMAGE_PULL_SUCCEEDED"});
  } catch (e) {
    yield put({type: "IMAGE_PULL_FAILED", message: e.message});
  }
}

function* watchImagesFetch() {
  yield* takeLatest("IMAGES_FETCH_REQUESTED", imagesFetch);
}

export function* imagesFetch(action) {
  try {
    const images = yield call(listImages);
    yield put({
      type: "IMAGES_FETCH_SUCCEEDED",
      images: images
    });
  } catch (e) {
    yield put({type: "IMAGES_FETCH_FAILED", message: e.message});
  }
}

export default function* watchers() {
  yield [
    watchImagesFetch()
  ];
}
