import fetch from 'isomorphic-fetch';

import { errorHandler, jsonHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listSecrets() {
  return fetch('/secrets', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectSecret(id) {
  return fetch(`/secrets/${id}`, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}
