const initialState = "";

function error(state = initialState, action) {
  if (action.type === 'RESET_ERROR') {
    return null;
  } else if (action.error) {
    return action.error;
  }

  return '';
}

export default error;
