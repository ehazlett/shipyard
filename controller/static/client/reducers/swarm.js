const initialState = {
  loading: false,
  initialized: null,
  info: {},
};

function swarm(state = initialState, action) {
  switch (action.type) {
    case 'SWARM_FETCH_REQUESTED':
      return {
        loading: true,
        initialized: state.initialized,
        info: state.info,
      }
    case 'SWARM_FETCH_SUCCEEDED':
      return {
        loading: false,
        info: action.swarm,
        initialized: true,
      };
    case 'SWARM_FETCH_FAILED':
      return {
        loading: false,
        info: action.swarm,
        initialized: 'unknown',
      };
    case 'SWARM_NOT_INITIALIZED':
      return {
        loading: false,
        info: {},
        initialized: false,
      };
    default:
      return state;
  }
}

export default swarm;
