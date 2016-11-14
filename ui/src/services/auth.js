export function getAuthToken() {
  return JSON.parse(localStorage.getItem('authToken'));
}

export function setAuthToken(token) {
  localStorage.setItem('authToken', JSON.stringify(token));
}

export function removeAuthToken() {
  localStorage.removeItem('authToken');
}
