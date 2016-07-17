import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function getSwarm() {
  return fetch('/swarm', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(statusHandler)
  .then(response => response.json());
}

export function updateSwarm(spec, version = 0) {
  return fetch(`/swarm/update?version=${version}`, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
    body: JSON.stringify(spec),
  })
  .then(statusHandler);
}

export function initSwarm() {
  return fetch('/swarm/init', {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
    body: JSON.stringify({
      ListenAddr: '0.0.0.0:2377',
      Spec: {
        Name: 'default',
        Labels: {},
      },
    }),
  })
  .then(statusHandler)
  .then(response => response.json());
}
