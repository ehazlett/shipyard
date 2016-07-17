export function fetchServices() {
  return {
    type: 'SERVICES_FETCH_REQUESTED',
  };
}

export function createService(spec) {
  return {
    type: 'CREATE_SERVICE_REQUESTED',
    spec,
  };
}

export function removeService(id) {
  return {
    type: 'REMOVE_SERVICE_REQUESTED',
    id,
  };
}

export function updateService(id, spec) {
  return {
    type: 'UPDATE_SERVICE_REQUESTED',
    id,
    spec,
  };
}
