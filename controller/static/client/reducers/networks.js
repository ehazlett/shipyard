function networks(state = [], action) {
  switch(action.type) {
    case 'NETWORKS_FETCH_SUCCEEDED':
      return action.networks;
    default:
      return state;
  }
}

export default networks;
