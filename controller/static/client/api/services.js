import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listServices() {
  return fetch('/services', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(statusHandler)
  .then(response => response.json());
}

export function createService(spec) {
  return fetch('/services/create', {
    method: 'POST',
    body: JSON.stringify(spec),
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(statusHandler)
  .then(response => response.json());
}
