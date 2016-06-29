function modals(state = [], action) {
  switch(action.type) {
    case 'SHOW_CREATE_VOLUME_MODAL':
      return {
        'create-volume-modal': true
      };
    case 'SHOW_CREATE_SERVICE_MODAL':
      return {
        'create-service-modal': true
      };
    case 'SHOW_PULL_IMAGE_MODAL':
      return {
        'pull-image': true
      };
    case 'HIDE_MODAL':
      return {};
    default:
      return state;
  }
}

export default modals;

