
export function login(username, password) {
  return {
    type: 'LOGIN_REQUESTED',
    username,
    password
  }
}
