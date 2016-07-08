import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { listServices, createService } from '../api/services';
import { listTasks } from '../api/tasks';

function* createServiceSaga(action) {
  try {
    yield call(createService, action.spec);
    yield put({
      type: 'CREATE_SERVICE_SUCCEEDED',
    });
    yield put({ type: 'SERVICES_FETCH_REQUESTED' });
    yield put({ type: 'HIDE_MODAL' });
  } catch (e) {
    yield put({ type: 'CREATE_SERVICE_FAILED', error: e.message });
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
    yield put({ type: 'SERVICES_FETCH_FAILED', error: e.message });
  }
}

function* watchServicesFetch() {
  yield* takeLatest('SERVICES_FETCH_REQUESTED', servicesFetch);
}

export default function* watchers() {
  yield [
    watchServicesFetch(),
    watchCreateService(),
  ];
}
