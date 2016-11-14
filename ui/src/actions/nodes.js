
export function fetchNodes() {
  return {
    type: 'NODES_FETCH_REQUESTED',
  };
}

export function acceptNode() {
  return {
    type: 'NODE_ACCEPT_REQUESTED',
  };
}

export function rejectNode() {
  return {
    type: 'NODE_REJECT_REQUESTED',
  };
}

export function activateNode() {
  return {
    type: 'NODE_ACTIVATE_REQUESTED',
  };
}

export function pauseNode() {
  return {
    type: 'NODE_PAUSE_REQUESTED',
  };
}

export function drainNode() {
  return {
    type: 'NODE_DRAIN_REQUESTED',
  };
}

export function disconnectNode() {
  return {
    type: 'NODE_DISCONNECT_REQUESTED',
  };
}

export function promoteNode() {
  return {
    type: 'NODE_PROMOTE_REQUESTED',
  };
}

export function demoteNode() {
  return {
    type: 'NODE_DEMOTE_REQUESTED',
  };
}
