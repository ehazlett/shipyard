function accounts(state = [], action) {
  switch (action.type) {
    case 'ACCOUNTS_FETCH_SUCCEEDED':
      return action.accounts;
    default:
      return state;
  }
}

export default accounts;
