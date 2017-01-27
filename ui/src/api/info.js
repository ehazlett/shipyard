import fetch from 'isomorphic-fetch';

import { errorHandler, jsonHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function getVersion() {
  return fetch('/version', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function getInfo() {
  return fetch('/info', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}
