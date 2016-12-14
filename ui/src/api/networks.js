import fetch from 'isomorphic-fetch';

import { jsonHandler, errorHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listNetworks() {
  return fetch('/networks', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}
