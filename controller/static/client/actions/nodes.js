
export function fetchNodes(index) {
  return {
    type: 'NODES_FETCH_REQUESTED'
  }
}

export function acceptNode(id) {
  return {
    type: 'NODE_ACCEPT_REQUESTED'
  }
}

export function rejectNode(id) {
  return {
    type: 'NODE_REJECT_REQUESTED'
  }
}

export function activateNode(id) {
  return {
    type: 'NODE_ACTIVATE_REQUESTED'
  }
}

export function pauseNode(id) {
  return {
    type: 'NODE_PAUSE_REQUESTED'
  }
}

export function drainNode(id) {
  return {
    type: 'NODE_DRAIN_REQUESTED'
  }
}

export function disconnectNode(id) {
  return {
    type: 'NODE_DISCONNECT_REQUESTED'
  }
}

export function promoteNode(id) {
  return {
    type: 'NODE_PROMOTE_REQUESTED'
  }
}

export function demoteNode(id) {
  return {
    type: 'NODE_DEMOTE_REQUESTED'
  }
}
