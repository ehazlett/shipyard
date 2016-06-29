import { push } from 'react-router-redux'
import store from '../store';

function swarm(state = [], action) {
  switch(action.type) {
    case 'SWARM_FETCH_SUCCEEDED':
      return {
        info: action.swarm,
        initialized: true
      };
    case 'SWARM_FETCH_FAILED':
      return {
        info: {},
        initialized: true
      };
    case 'SWARM_NOT_INITIALIZED':
      return {
        info: {},
        initialized: false
      };
    default:
      return state;
  }
}

export default swarm;
