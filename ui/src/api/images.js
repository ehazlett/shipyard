import fetch from 'isomorphic-fetch';
import $ from 'jquery';

import { errorHandler, jsonHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listImages(all = false) {
  return fetch(`/images/json${all ? '?all=1' : ''}`, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function pullImage(imageName) {
  return fetch(`/images/create?fromImage=${imageName}`, {
    method: 'POST',
  })
    .then(errorHandler);
}

export function removeImage(id, force = false) {
  const params = {
    force
  };
  const url = `/images/${id}?${$.param(params)}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler);
}

export function inspectImage(id) {
  const url = `/images/${id}/json`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function historyImage(id) {
  const url = `/images/${id}/history`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}
