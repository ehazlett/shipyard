function containers(state = [], action) {
  switch(action.type) {
    case 'CONTAINERS_FETCH_SUCCEEDED':
      return action.containers;
    default:
      return state;
  }
}

export default containers;
