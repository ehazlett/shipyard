import _ from 'lodash';

const initialState = [];

function events(state = initialState, action) {
  switch (action.type) {
    case 'NEW_EVENT':
      return [action.event, ...state];
    default:
      return state;
  }
}

export default events;
