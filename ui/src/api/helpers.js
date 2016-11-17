export function jsonHandler(response) {
  return response.json().then((json) => {
    if (response.status >= 200 && response.status < 300) {
      return { json, response };
    } else {
      return Promise.reject({ json, response });
    }
  });
}

// Handles JSON error messages only, in the case wher error
// messages are supplied in JSON format, but errors are JSON
export function jsonErrorHandler(response) {
  if (!response.ok) {
    return response.json().then((json) => {
      return Promise.reject({ json, response });
    });
  } else {
    return { response };
  }
}

// Handles JSON success messages only, in the case where success
// messages are supplied in JSON format, but errors are text
export function jsonSuccessHandler(response) {
  if (response.ok) {
    return response.json().then((json) => {
      if (response.status >= 200 && response.status < 300) {
        return { json, response };
      } else {
        return Promise.reject({ json, response });
      }
    });
  } else {
    return Promise.reject({ response });
  }
}
