export function fetchImages() {
  return {
    type: 'IMAGES_FETCH_REQUESTED',
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

