function user(state = [], action) {
  switch(action.type) {
    case 'LOGIN_SUCCEEDED':
      return {
        auth_token: action.response.auth_token,
        user_agent: action.response.user_agent
      };
    case 'LOGIN_FAILED':
      return {
        error: action.message
      };
    default:
      return state;
  }
}

export default user;
