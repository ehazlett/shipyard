import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';

export function listVolumes() {
  return fetch('/volumes')
    .then(statusHandler)
    .then(response => response.json());
}

export function createVolume(volume) {
  return fetch('/volumes/create', {
				method: 'POST',
        body: JSON.stringify(volume),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
			})
    .then(statusHandler)
    .then(response => response.json());
}
