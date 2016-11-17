export function getAuthToken() {
  return JSON.parse(localStorage.getItem('authToken'));
}

export function setAuthToken(username, token) {
  localStorage.setItem('authToken', JSON.stringify(`${username}:${token}`));
}

export function removeAuthToken() {
  localStorage.removeItem('authToken');
}
