import fetch from 'isomorphic-fetch';
import $ from 'jquery';

import { errorHandler, jsonHandler, textHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listContainers(all = false) {
  const url = `/containers/json?${all ? 'all=1' : ''}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectContainer(id) {
  const url = `/containers/${id}/json`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function logsContainer(id, stdout = 1, stderr = 1, timestamps = 0) {
  const url = `/containers/${id}/logs?&stdout=${stdout}&stderr=${stderr}&timestamps=${timestamps}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(textHandler);
}

export function stopContainer(id, timeout = 0) {
  const url = `/containers/${id}/stop?${timeout ? 't='+timeout : ''}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler);
}

export function startContainer(id) {
  const url = `/containers/${id}/start`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler);
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
    .then(errorHandler);
}
