import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listImages() {
  return fetch('/images/json', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(statusHandler)
  .then(response => response.json());
}

export function pullImage(imageName) {
  return fetch(`/images/create?fromImage=${imageName}`, {
    method: 'POST',
  })
  .then(statusHandler)
  .then(response => response.json());
}
