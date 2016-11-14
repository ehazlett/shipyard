import _ from 'lodash';

const initialState = {
  loading: false,
  data: {},
};

function info(state = initialState, action) {
  switch (action.type) {
    case 'INFO_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      };
    case 'INFO_FETCH_SUCCEEDED':
      return {
        loading: false,
        data: action.info.json,
      };
    case 'INFO_FETCH_FAILED':
      return {
        loading: false,
        data: {},
      };
    default:
      return state;
  }
}

export default info;
