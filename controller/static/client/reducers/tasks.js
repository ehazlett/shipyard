function tasks(state = [], action) {
  switch(action.type) {
    case 'SERVICES_FETCH_SUCCEEDED':
      if(action.tasks) {
        return action.tasks;
      } else {
        return [];
      }
    default:
      return state;
  }
}

export default tasks;
