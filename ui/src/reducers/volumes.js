import _ from 'lodash';

const initialState = {
  loading: false,
  data: {},
};

function volumes(state = initialState, action) {
  switch (action.type) {
    case 'VOLUMES_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      };
    case 'VOLUMES_FETCH_SUCCEEDED':
      return {
        loading: false,
        data: _.keyBy(action.volumes.Volumes, 'Name'),
      };
    case 'VOLUMES_FETCH_FAILED':
      return {
        loading: false,
        data: {},
      };
    default:
      return state;
  }
}

export default volumes;
