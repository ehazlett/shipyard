import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers.js';

export function listNetworks() {
  return fetch('/networks')
    .then(statusHandler)
    .then(response => response.json());
}
