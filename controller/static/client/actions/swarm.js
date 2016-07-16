export function updateSwarmSettings(spec, version) {
  return {
    type: 'SWARM_UPDATE_SETTINGS_REQUESTED',
    spec,
    version,
  };
}
export function fetchSwarm() {
  return {
    type: 'SWARM_FETCH_REQUESTED',
  };
}

export function swarmInit() {
  return {
    type: 'SWARM_INIT_REQUESTED',
  };
}

