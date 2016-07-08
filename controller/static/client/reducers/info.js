function info(state = [], action) {
  switch (action.type) {
    case 'INFO_FETCH_SUCCEEDED':
      return action.info;
    case 'INFO_FETCH_FAILED':
      return [];
    default:
      return state;
  }
}

export default info;
