import fetch from 'isomorphic-fetch';

import { jsonHandler, jsonSuccessHandler, jsonErrorHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function getSwarm() {
  return fetch('/swarm', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(jsonSuccessHandler);
}

export function updateSwarm(spec, version = 0, rotateManagerToken = false, rotateWorkerToken = false) {
  return fetch(`/swarm/update?version=${version}&rotateManagerToken=${rotateManagerToken}&rotateWorkerToken=${rotateWorkerToken}`, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
    body: JSON.stringify(spec),
  })
    .then(jsonErrorHandler);
}

export function initSwarm(spec) {
  return fetch('/swarm/init', {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
    body: JSON.stringify(spec)
  })
    .then(jsonHandler);
}
