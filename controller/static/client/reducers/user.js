function user(state = [], action) {
  switch (action.type) {
    case 'SIGN_IN_SUCCEEDED':
      return {
        username: action.username,
        token: action.token,
      };
    case 'SIGN_IN_FAILED':
      return {
        error: action.message,
      };
    case 'SIGNED_OUT':
      return {};
    default:
      return state;
  }
}

export default user;
