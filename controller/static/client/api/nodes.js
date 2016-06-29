import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers.js';

export function listNodes() {
  return fetch('/nodes')
    .then(statusHandler)
    .then(response => response.json());
}
