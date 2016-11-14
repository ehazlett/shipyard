
export function fetchEvents() {
  return {
    type: 'EVENTS_FETCH_REQUESTED',
  };
}

export function newEvent(event) {
  return {
    type: 'NEW_EVENT',
    event,
  };
}

