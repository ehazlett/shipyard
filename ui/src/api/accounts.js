import fetch from 'isomorphic-fetch';

import { jsonHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listAccounts() {
  return fetch('/api/accounts', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
  .then(jsonHandler);
}
