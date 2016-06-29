
export function showCreateVolumeModal() {
  return {
    type: 'SHOW_CREATE_VOLUME_MODAL'
  }
}

export function createVolume(volume) {
  return {
    type: 'CREATE_VOLUME_REQUESTED',
    volume
  }
}

export function fetchVolumes(index) {
  return {
    type: 'VOLUMES_FETCH_REQUESTED'
  }
}
