function nodes(state = [], action) {
  switch (action.type) {
    case 'NODES_FETCH_SUCCEEDED':
      return action.nodes;
    default:
      return state;
  }
}

export default nodes;
