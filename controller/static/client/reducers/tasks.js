function tasks(state = [], action) {
  switch (action.type) {
    case 'SERVICES_FETCH_SUCCEEDED':
      if (action.tasks) {
        return action.tasks;
      }
      return [];

    default:
      return state;
  }
}

export default tasks;
