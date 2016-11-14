export function fetchContainers(all = true) {
  return {
    type: 'CONTAINERS_FETCH_REQUESTED',
    all,
  };
}

export function removeContainer(id, volumes, force) {
  return {
    type: 'CONTAINER_REMOVE_REQUESTED',
    id,
    // Whether to remove volumes
    volumes,
    // Whether to force removal
    force,
  };
}

export function startContainer(id) {
  return {
    type: 'CONTAINER_START_REQUESTED',
    id,
  };
}

export function stopContainer(id, timeout = 0) {
  return {
    type: 'CONTAINER_STOP_REQUESTED',
    id,
    timeout,
  };
}

