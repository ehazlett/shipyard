const initialState = {
  loading: false,
  data: [],
};

function tasks(state = initialState, action) {
  switch (action.type) {
    case 'SERVICES_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      };
    case 'SERVICES_FETCH_SUCCEEDED':
      return {
        loading: false,
        data: action.tasks,
      };
    case 'SERVICES_FETCH_FAILED':
      return {
        loading: false,
        data: [],
      };
    default:
      return state;
  }
}

export default tasks;
