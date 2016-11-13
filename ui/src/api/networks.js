import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listNetworks() {
  return fetch('/networks', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(statusHandler)
  .then(response => response.json());
}
