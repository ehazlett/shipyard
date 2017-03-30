import fetch from "isomorphic-fetch";

import { errorHandler, jsonHandler } from "./helpers.js";
import { getAuthToken } from "../services/auth";

export function listRegistries() {
  return fetch("/api/registries", {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectRegistry(id) {
  return fetch(`/api/registries/${id}`, {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function repositoriesRegistry(id) {
  return fetch(`/api/registries/${id}/repositories`, {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function addRegistry(request) {
  return fetch(`/api/registries`, {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "X-Access-Token": getAuthToken()
    }
  }).then(errorHandler);
}
