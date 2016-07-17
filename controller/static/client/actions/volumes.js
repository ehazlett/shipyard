export function createVolume(volume) {
  return {
    type: 'CREATE_VOLUME_REQUESTED',
    volume,
  };
}

export function fetchVolumes() {
  return {
    type: 'VOLUMES_FETCH_REQUESTED',
  };
}
