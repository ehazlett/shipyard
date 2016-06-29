import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';

export function listServices() {
  return fetch('/services')
    .then(statusHandler)
    .then(response => response.json());
}

export function createService(spec) {
  return fetch('/services/create', {
				method: 'POST',
				body: JSON.stringify(spec)
			})
    .then(statusHandler)
    .then(response => response.json());
}
