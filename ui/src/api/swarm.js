import fetch from "isomorphic-fetch";

import { jsonHandler, errorHandler } from "./helpers";
import { getAuthToken } from "../services/auth";

export function getSwarm() {
  return fetch("/swarm", {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function updateSwarm(
  spec,
  version = 0,
  rotateManagerToken = false,
  rotateWorkerToken = false
) {
  return fetch(
    `/swarm/update?version=${version}&rotateManagerToken=${rotateManagerToken}&rotateWorkerToken=${rotateWorkerToken}`,
    {
      method: "POST",
      headers: {
        "X-Access-Token": getAuthToken()
      },
      body: JSON.stringify(spec)
    }
  ).then(errorHandler);
}

export function initSwarm(spec) {
  return fetch("/swarm/init", {
    method: "POST",
    headers: {
      "X-Access-Token": getAuthToken()
    },
    body: JSON.stringify(spec)
  }).then(errorHandler);
}
