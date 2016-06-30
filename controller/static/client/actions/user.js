
export function signIn(credentials) {
  return {
    type: 'SIGN_IN',
    credentials,
  };
}

export function signOut() {
  return {
    type: 'SIGN_OUT',
  };
}
