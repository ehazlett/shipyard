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

export function updateService(id, spec) {
  const url = `/services/${id}/update`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
    body: JSON.stringify(spec),
  })
  .then(statusHandler);
}

export function removeService(id) {
  const url = `/services/${id}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(statusHandler);
}
