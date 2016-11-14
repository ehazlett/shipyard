import _ from 'lodash';

const initialState = {
  loading: false,
  data: {},
};

function services(state = initialState, action) {
  switch (action.type) {
    case 'SERVICES_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      };
    case 'SERVICES_FETCH_SUCCEEDED':
      return {
        loading: false,
        // FIXME: The upstream Services API returns null when empty
        data: _.keyBy(action.services.json, 'ID'),
      };
    case 'SERVICES_FETCH_FAILED':
      return {
        loading: false,
        data: {},
      };
    default:
      return state;
  }
}

export default services;
