import fetch from 'isomorphic-fetch';

import { jsonHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listVolumes() {
  return fetch('/volumes', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}

export function createVolume(volume) {
  return fetch('/volumes/create', {
    method: 'POST',
    body: JSON.stringify(volume),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}
