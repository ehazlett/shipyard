import fetch from 'isomorphic-fetch';
import $ from 'jquery';

import { jsonHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listContainers(all = false) {
  const url = `/containers/json?${all ? 'all=1' : ''}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}

export function stopContainer(id, timeout = 0) {
  const url = `/containers/${id}/stop?${timeout ? 't='+timeout : ''}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}

export function startContainer(id) {
  const url = `/containers/${id}/start`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}

export function removeContainer(id, volumes = false, force = false) {
  const params = {
    v: volumes,
    force
  };
  const url = `/containers/${id}?${$.param(params)}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}
