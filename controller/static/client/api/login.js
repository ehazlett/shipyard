import fetch from 'isomorphic-fetch';

import { statusHandler } from './helpers.js';

export function login(username, password) {
  return fetch('/auth/login', {
				                                        method: 'POST',
				                                        body: JSON.stringify({
  username,
  password,
				}),
			                    })
    .then(statusHandler)
    .then(response => response.json());
}
