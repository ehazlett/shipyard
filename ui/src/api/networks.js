import fetch from 'isomorphic-fetch';

import { jsonHandler, errorHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listNetworks() {
  return fetch('/networks', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectNetwork(id) {
  const url = `/networks/${id}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function createNetwork(network) {
  return fetch('/networks/create', {
    method: 'POST',
    body: JSON.stringify(network),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
}

export function removeNetwork(name) {
  const url = `/networks/${name}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler);
}
