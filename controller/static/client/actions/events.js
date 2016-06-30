
export function fetchEvents(index) {
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

