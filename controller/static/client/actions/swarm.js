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

