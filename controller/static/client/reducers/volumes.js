function volumes(state = [], action) {
  switch (action.type) {
    case 'VOLUMES_FETCH_SUCCEEDED':
      return action.volumes.Volumes;
    default:
      return state;
  }
}

export default volumes;
