const initialState = {
  loading: false,
  data: [],
};

function containers(state = initialState, action) {
  switch (action.type) {
    case 'CONTAINERS_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      }
    case 'CONTAINERS_FETCH_SUCCEEDED':
      return {
        loading: false,
        data: action.containers,
      }
    case 'CONTAINERS_FETCH_FAILED':
      return {
        loading: false,
        data: [],
      }
    default:
      return state;
  }
}

export default containers;
