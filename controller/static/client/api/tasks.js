import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';

export function listTasks() {
  return fetch('/tasks')
    .then(statusHandler)
    .then(response => response.json());
}
