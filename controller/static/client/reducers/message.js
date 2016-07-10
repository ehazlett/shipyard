const initialState = {
  level: '',
  message: '',
};

function message(state = initialState, action) {
  if (action.type === 'RESET_MESSAGE') {
    return initialState;
  } else if (action.message) {
    return {
      level: action.messageLevel,
      message: action.message,
    };
  }

  return initialState;
}

export default message;
