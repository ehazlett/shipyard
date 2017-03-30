import fetch from "isomorphic-fetch";

import { jsonHandler, errorHandler } from "./helpers";
import { getAuthToken } from "../services/auth";

export function listAccounts() {
  return fetch("/api/accounts", {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectAccount(id) {
  const url = `/api/accounts/${id}`;
  return fetch(url, {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function updateAccount(account) {
  return fetch("/api/accounts", {
    method: "POST",
    body: JSON.stringify(account),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Access-Token": getAuthToken()
    }
  }).then(errorHandler);
}

export function createAccount(account) {
  return fetch("/api/accounts", {
    method: "POST",
    body: JSON.stringify(account),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Access-Token": getAuthToken()
    }
  }).then(errorHandler);
}

export function removeAccount(id) {
  const url = `/api/accounts/${id}`;
  return fetch(url, {
    method: "DELETE",
    headers: {
      "X-Access-Token": getAuthToken()
    }
  }).then(errorHandler);
}
