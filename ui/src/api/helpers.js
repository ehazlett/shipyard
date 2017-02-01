import { removeAuthToken } from '../services/auth';

export const errorHandler = (response) => {
  if(response.ok) {
    return Promise.resolve(response);
  } else if(response.status === 401) {
    // FIXME: Force user back to the login screen when they
    // have an invalid token, there should be a more graceful
    // way of doing this I think.
    removeAuthToken();
    location.href = '/#/login';
  }

  return response.json().then(json => {
    const error = new Error(json.message || response.statusText)
    return Promise.reject(Object.assign(error, { response }));
  })
}

export const textHandler = (response) => {
  return response.text().then((body) => {
    return { body, response };
  });
}

export const jsonHandler = (response) => {
  return response.json().then((body) => {
    return { body, response };
  });
}

export const dockerErrorHandler = (response) => {
  return response.json().then((body) => {
    const matchedGroups = /code = (.+?) desc = (.+?)$/.exec(body.message);
    return {
      message: matchedGroups[0],
      code: matchedGroups[1],
      desc: matchedGroups[2],
      response,
    };
  });
}
