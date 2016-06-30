import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';
import { getAuthToken } from '../services/auth';

export function listVolumes() {
  return fetch('/volumes', {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(statusHandler)
    .then(response => response.json());
}

export function createVolume(volume) {
  return fetch('/volumes/create', {
				                                        method: 'POST',
    body: JSON.stringify(volume),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Access-Token': getAuthToken(),
    },
			                    })
    .then(statusHandler)
    .then(response => response.json());
}
