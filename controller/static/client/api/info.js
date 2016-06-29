import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers.js';

export function getInfo() {
  return fetch('/info')
    .then(statusHandler)
    .then(response => response.json());
}
