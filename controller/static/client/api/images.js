import fetch from 'isomorphic-fetch';
import $ from 'jquery';

import { statusHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listImages(all = false) {
  return fetch(`/images/json?${all ? 'all=1' : ''}`, {
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
  .then(statusHandler);
}
