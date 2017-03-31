import fetch from "isomorphic-fetch";

import { errorHandler, jsonHandler } from "./helpers.js";
import { getAuthToken } from "../services/auth";

export function listServices() {
  return fetch("/services", {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectService(id) {
  return fetch(`/services/${id}`, {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function createService(spec) {
  return fetch("/services/create", {
    method: "POST",
    body: JSON.stringify(spec),
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function updateService(id, spec, version) {
  const url = `/services/${id}/update?version=${version}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "X-Access-Token": getAuthToken()
    },
    body: JSON.stringify(spec)
  }).then(errorHandler);
}

export function removeService(id) {
  const url = `/services/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: {
      "X-Access-Token": getAuthToken()
    }
  }).then(errorHandler);
}
