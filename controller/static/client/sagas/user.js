// https://github.com/yelouafi/redux-saga/issues/14#issuecomment-167038759

import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { login } from '../api/login';
import { setAuthToken, removeAuthToken } from '../services/auth';

import { swarmFetch } from './swarm';

function* init() {
  yield call(swarmFetch);
}

export function* tryLogin(action) {
  try {
    const response = yield call(login, action.username, action.password);
    setAuthToken(action.username + ':' + response.auth_token);
    yield put({
      type: 'LOGIN_SUCCEEDED',
      response,
    });
  } catch (e) {
    yield put({ type: 'LOGIN_FAILED', message: e.message });
    removeAuthToken();
  }
}

function* watchLogin() {
  yield* takeLatest('LOGIN_REQUESTED', tryLogin);
}

function* watchLoginSuccess() {
  yield* takeLatest('LOGIN_SUCCEEDED', init);
}

export default function* watchers() {
  yield [
    watchLogin(),
    watchLoginSuccess(),
  ];
}
