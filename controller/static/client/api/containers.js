import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listContainers() {
  return fetch('/containers/json', {
    headers: {
      'X-Access-Token': getAuthToken()
    }
  })
  .then(statusHandler)
  .then(response => response.json());
}

