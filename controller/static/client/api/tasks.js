import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listTasks() {
  return fetch('/tasks', {
    headers: {
      'X-Access-Token': getAuthToken()
    }
  })
    .then(statusHandler)
    .then(response => response.json());
}
