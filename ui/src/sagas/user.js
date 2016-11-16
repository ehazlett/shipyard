import { takeLatest } from 'redux-saga';
import { take, call, put } from 'redux-saga/effects';

import { login } from '../api/login';
import { getAuthToken, setAuthToken, removeAuthToken } from '../services/auth';

import { swarmFetch } from './swarm';

export function* authorize(credentials) {
  const response = yield call(login, credentials.username, credentials.password);
  const token = `${credentials.username}:${response.json.auth_token}`;
  yield call(setAuthToken, token);
  yield put({
    type: 'SIGN_IN_SUCCEEDED',
    username: credentials.username,
    token,
  });
  return token;
}

export function* signout(error) {
  yield call(removeAuthToken);
  yield put({
    type: 'SIGNED_OUT',
    error,
  });
}

// https://github.com/yelouafi/redux-saga/issues/14#issuecomment-167038759
function* authFlowSaga() {
  // Attempt to retrieve any existing token
  let token = yield call(getAuthToken);

  // TODO: Validate existing token, if invalid, remove it

  while (true) {
    // If the user doesn't have a token, wait for sign in
    if (!token) {
      const { credentials } = yield take('SIGN_IN');
      token = yield call(authorize, credentials);
    }

    // authorization failed, wait the next sign in
    if (!token) {
      continue;
    }

    // User has a token, so they're logged in, so only
    // listen for SIGN_OUT actions
    yield take('SIGN_OUT');
    yield call(signout);
    token = null;
  }
}

function* init() {
  yield call(swarmFetch);
}

function* watchSignInSuccess() {
  yield* takeLatest('SIGN_IN_SUCCEEDED', init);
}

export default function* watchers() {
  yield [
    authFlowSaga(),
    watchSignInSuccess(),
  ];
}
