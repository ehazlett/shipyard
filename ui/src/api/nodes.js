import fetch from 'isomorphic-fetch';

import { jsonHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listNodes() {
  return fetch('/nodes', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}
