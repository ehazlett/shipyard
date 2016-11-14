export function jsonHandler(response) {
  return response.json().then((json) => {
    if (response.status >= 200 && response.status < 300) {
      return { json, response };
    } else {
      return Promise.reject({ json, response });
    }
  });
}

// Handles JSON error messages only
export function jsonErrorHandler(response) {
  if (!response.ok) {
    return response.json().then((json) => {
        return Promise.reject({ json, response });
    });
  } else {
    return { response };
  }
}
