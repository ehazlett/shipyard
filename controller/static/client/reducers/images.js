function images(state = [], action) {
  switch(action.type) {
    case 'IMAGES_FETCH_SUCCEEDED':
      return action.images;
    default:
      return state;
  }
}

export default images;
