export const errorHandler = (response) => {
  if (!response.ok) {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }

  return response;
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
