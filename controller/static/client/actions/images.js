export function fetchImages(all) {
  return {
    type: 'IMAGES_FETCH_REQUESTED',
    all,
  };
}

export function showPullImageModal() {
  return {
    type: 'SHOW_PULL_IMAGE_MODAL',
  };
}

export function pullImage(imageName) {
  return {
    type: 'PULL_IMAGE_REQUESTED',
    imageName,
  };
}

export function removeImage(id) {
  return {
    type: 'IMAGE_REMOVE_REQUESTED',
    id,
  };
}
