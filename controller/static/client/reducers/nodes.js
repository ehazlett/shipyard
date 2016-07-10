const initialState = {
  loading: false,
  data: {},
};

function nodes(state = initialState, action) {
  switch (action.type) {
    case 'NODES_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      }
    case 'NODES_FETCH_SUCCEEDED':
      return {
        loading: false,
        data: _.keyBy(action.nodes, 'ID'),
      };
    case 'NODES_FETCH_FAILED':
      return {
        loading: false,
        data: {},
      };
    default:
      return state;
  }
}

export default nodes;
