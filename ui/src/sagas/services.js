import { takeLatest, takeEvery } from 'redux-saga';
import { take, call, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import {
  listServices,
  createService,
  updateService,
  removeService,
} from '../api/services';
import { listTasks } from '../api/tasks';

function* createServiceSaga(action) {
  try {
    yield call(createService, action.spec);
    yield put({
      type: 'CREATE_SERVICE_SUCCEEDED',
      message: `Successfully created service`,
      level: 'success',
    });
    yield put({ type: 'SERVICES_FETCH_REQUESTED' });
  } catch (e) {
    yield put({ type: 'CREATE_SERVICE_FAILED', message: e.message, level: 'error' });
  }
}
// Upon successfully creating a service, navigate to the services page
function* watchCreateServiceSucceeded() {
  while (true) {
    yield take('CREATE_SERVICE_SUCCEEDED');
    yield put(push('/services'));
  }
}

function* watchCreateService() {
  yield* takeLatest('CREATE_SERVICE_REQUESTED', createServiceSaga);
}

export function* servicesFetch() {
  try {
    const services = yield call(listServices);
    const tasks = yield call(listTasks);
    yield put({
      type: 'SERVICES_FETCH_SUCCEEDED',
      services,
      tasks,
    });
  } catch (e) {
    yield put({ type: 'SERVICES_FETCH_FAILED', message: e.message, level: 'error' });
  }
}

function* watchServicesFetch() {
  yield* takeLatest('SERVICES_FETCH_REQUESTED', servicesFetch);
}

export function* serviceUpdate(action) {
  try {
    yield call(updateService, action.id);

    // Signal that update succeeded
    yield put({
      type: 'UPDATE_SERVICE_SUCCEEDED',
      id: action.id,
    });

    yield call(servicesFetch);
  } catch (e) {
    yield put({ type: 'UPDATE_SERVICE_FAILED', message: e.message, level: 'error' });
  }
}

function* watchServiceUpdate() {
  yield* takeEvery('UPDATE_SERVICE_REQUESTED', serviceUpdate);
}

export function* serviceRemove(action) {
  try {
    yield call(removeService, action.id);

    // Signal that remove succeeded
    yield put({
      type: 'REMOVE_SERVICE_SUCCEEDED',
      id: action.id,
      message: `Successfully removed service ${action.id}`,
      level: 'success',
    });

    // Refresh after removing a service
    yield call(servicesFetch);
  } catch (e) {
    yield put({ type: 'REMOVE_SERVICE_FAILED', message: e.message, level: 'error' });
  }
}

function* watchServiceRemove() {
  yield* takeEvery('REMOVE_SERVICE_REQUESTED', serviceRemove);
}

export default function* watchers() {
  yield [
    watchServicesFetch(),
    watchCreateService(),
    watchCreateServiceSucceeded(),
    watchServiceRemove(),
    watchServiceUpdate(),
  ];
}
