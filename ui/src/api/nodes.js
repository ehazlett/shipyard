import fetch from "isomorphic-fetch";

import { jsonHandler, errorHandler } from "./helpers";
import { getAuthToken } from "../services/auth";

export function listNodes() {
  return fetch("/nodes", {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}

export function inspectNode(nodeId) {
  return fetch(`/nodes/${nodeId}`, {
    headers: {
      "X-Access-Token": getAuthToken()
    }
  })
    .then(errorHandler)
    .then(jsonHandler);
}
