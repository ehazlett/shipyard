import fetch from 'isomorphic-fetch';

import { errorHandler, jsonHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listTasks() {
  return fetch('/tasks', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function listTasksForService(serviceId) {
  const filters = JSON.stringify({
    service: {
      [serviceId]: true,
    },
  });
  return fetch(`/tasks?filters=${filters}`, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function listTasksForNode(nodeId) {
  const filters = JSON.stringify({
    node: {
      [nodeId]: true,
    },
  });
  return fetch(`/tasks?filters=${filters}`, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}
