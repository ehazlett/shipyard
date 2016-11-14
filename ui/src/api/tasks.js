import fetch from 'isomorphic-fetch';

import { jsonHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listTasks() {
  return fetch('/tasks', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(jsonHandler);
}
