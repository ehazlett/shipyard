import _ from 'lodash';

const initialState = {
  loading: false,
  data: {},
};

function images(state = initialState, action) {
  switch (action.type) {
    case 'IMAGES_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      };
    case 'IMAGES_FETCH_SUCCEEDED':
      return {
        loading: false,
        data: _.keyBy(action.images, 'Id'),
      };
    case 'IMAGES_FETCH_FAILED':
      return {
        loading: false,
        data: {},
      };
    default:
      return state;
  }
}

export default images;
