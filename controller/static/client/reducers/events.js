function events(state = [], action) {
  switch (action.type) {
    case 'NEW_EVENT':
      return [action.event, ...state];
    default:
      return state;
  }
}

export default events;
