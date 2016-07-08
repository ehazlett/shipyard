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

export function showCreateServiceModal() {
  return {
    type: 'SHOW_CREATE_SERVICE_MODAL',
  };
}

