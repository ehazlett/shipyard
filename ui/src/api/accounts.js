import fetch from 'isomorphic-fetch';

import { jsonHandler, errorHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listAccounts() {
  return fetch('/api/accounts', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectAccount(id) {
  const url = `/api/accounts/${id}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}
