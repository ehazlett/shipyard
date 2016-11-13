import _ from 'lodash';

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
        initialized: true,
        info: action.swarm,
      };
    case 'SWARM_FETCH_FAILED':
      return {
        loading: false,
        initialized: 'unknown',
        info: {},
      };
    case 'SWARM_NOT_INITIALIZED':
      return {
        loading: false,
        initialized: false,
        info: {},
      };
    default:
      return state;
  }
}

export default swarm;
