import fetch from 'isomorphic-fetch';
import queryString from 'query-string';

import { errorHandler, jsonHandler, textHandler } from './helpers.js';
import { getAuthToken } from '../services/auth';

export function listContainers(all = false) {
  const url = `/containers/json?${all ? 'all=1' : ''}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectContainer(id) {
  const url = `/containers/${id}/json`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function topContainer(id) {
  const url = `/containers/${id}/top`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function logsContainer(id, params) {
  const url = `/containers/${id}/logs?${queryString.stringify(params)}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(textHandler);
}

export function execContainer(id) {
  const url = `/api/consolesession/${id}`;
  return fetch(url, {
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function stopContainer(id, timeout = 0) {
  const url = `/containers/${id}/stop?${timeout ? 't='+timeout : ''}`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler);
}

export function startContainer(id) {
  const url = `/containers/${id}/start`;
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler);
}

export function restartContainer(id) {
    const url = `/containers/${id}/restart`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Access-Token': getAuthToken(),
        },
    })
        .then(errorHandler);
}

export function pauseContainer(id) {
    const url = `/containers/${id}/pause`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Access-Token': getAuthToken(),
        },
    })
        .then(errorHandler);
}

export function unpauseContainer(id) {
    const url = `/containers/${id}/unpause`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Access-Token': getAuthToken(),
        },
    })
        .then(errorHandler);
}

export function killContainer(id) {
    const url = `/containers/${id}/kill`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Access-Token': getAuthToken(),
        },
    })
        .then(errorHandler);
}

export function removeContainer(id, volumes = false, force = false) {
  const params = {
    v: volumes,
    force
  };
  const url = `/containers/${id}?${queryString.stringify(params)}`;
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Access-Token': getAuthToken(),
    },
  })
    .then(errorHandler);
}
