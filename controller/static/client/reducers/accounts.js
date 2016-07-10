const initialState = {
  loading: false,
  data: {},
};

function accounts(state = initialState, action) {
  switch (action.type) {
    case 'ACCOUNTS_FETCH_REQUESTED':
      return {
        loading: true,
        data: state.data,
      };
    case 'ACCOUNTS_FETCH_SUCCEEDED':
      return {
        loading: false,
        data: _.keyBy(action.accounts, 'id'),
      }
    case 'ACCOUNTS_FETCH_FAILED':
      return {
        loading: false,
        data: {},
      }
    default:
      return state;
  }
}

export default accounts;
