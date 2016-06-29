import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers';

export function getSwarm() {
  return fetch('/swarm')
    .then(statusHandler)
    .then(response => response.json());
}

export function initSwarm() {
  return fetch('/swarm/init', {
				method: 'POST',
				body: JSON.stringify({
					ListenAddr: '0.0.0.0:2377',
					Spec: {
						Name: 'default',
						Labels: {},
					}
				})
			})
    .then(statusHandler)
    .then(response => response.json());
}
