

export function fetchSwarm(index) {
  return {
    type: 'SWARM_FETCH_REQUESTED',
  };
}

export function swarmInit(index) {
  return {
    type: 'SWARM_INIT_REQUESTED',
  };
}

