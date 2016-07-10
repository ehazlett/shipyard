import { takeEvery, takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import {
  listContainers,
  stopContainer,
  removeContainer,
  startContainer
} from '../api/containers.js';

export function* containersFetch() {
  try {
    const containers = yield call(listContainers, true);
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

export function* containerStop(action) {
  try {
    yield call(stopContainer, action.id, action.timeout);

    // Signal that remove succeeded
    yield put({
      type: 'CONTAINER_STOP_SUCCEEDED',
      id: action.id,
    });

    // Refresh after removing a container
    yield call(containersFetch);
  } catch (e) {
    yield put({ type: 'CONTAINER_STOP_FAILED', error: e.message });
  }
}

function* watchContainerStop() {
  yield* takeEvery('CONTAINER_STOP_REQUESTED', containerStop);
}

export function* containerStart(action) {
  try {
    yield call(startContainer, action.id);

    // Signal that start succeeded
    yield put({
      type: 'CONTAINER_START_SUCCEEDED',
      id: action.id,
    });

    // Refresh after removing a container
    yield call(containersFetch);
  } catch (e) {
    yield put({ type: 'CONTAINER_START_FAILED', error: e.message });
  }
}

function* watchContainerStart() {
  yield* takeEvery('CONTAINER_START_REQUESTED', containerStart);
}

export function* containerRemove(action) {
  try {
    yield call(removeContainer, action.id, action.volumes, action.force);

    // Signal that remove succeeded
    yield put({
      type: 'CONTAINER_REMOVE_SUCCEEDED',
      id: action.id,
    });

    // Refresh after removing a container
    yield call(containersFetch);
  } catch (e) {
    yield put({ type: 'CONTAINER_REMOVE_FAILED', error: e.message });
  }
}

function* watchContainerRemove() {
  yield* takeEvery('CONTAINER_REMOVE_REQUESTED', containerRemove);
}

export default function* watchers() {
  yield [
    watchContainersFetch(),
    watchContainerRemove(),
    watchContainerStop(),
    watchContainerStart(),
  ];
}
