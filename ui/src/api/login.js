import fetch from "isomorphic-fetch";

import { errorHandler, jsonHandler } from "./helpers.js";
import { setAuthToken } from "../services/auth";

const saveTokenHandler = (response, username) => {
  setAuthToken(username, response.body.auth_token);
  return response;
};

export function login(username, password) {
  return fetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    })
  })
    .then(errorHandler)
    .then(jsonHandler)
    .then(r => {
      return saveTokenHandler(r, username);
    });
}
