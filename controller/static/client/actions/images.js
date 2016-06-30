export function fetchImages(index) {
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

