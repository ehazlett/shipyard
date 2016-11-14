export function updateSwarmSettings(spec, version, rotateManagerToken, rotateWorkerToken) {
  return {
    type: 'SWARM_UPDATE_SETTINGS_REQUESTED',
    spec,
    version,
    rotateManagerToken,
    rotateWorkerToken
  };
}
export function fetchSwarm() {
  return {
    type: 'SWARM_FETCH_REQUESTED',
  };
}

export function swarmInit(spec) {
  return {
    type: 'SWARM_INIT_REQUESTED',
    spec
  };
}

