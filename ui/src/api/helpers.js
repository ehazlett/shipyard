export const errorHandler = (response) => {
  if(response.ok) {
    return Promise.resolve(response);
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
