function services(state = [], action) {
  switch (action.type) {
    case 'SERVICES_FETCH_SUCCEEDED':
      return action.services;
    default:
      return state;
  }
}

export default services;
