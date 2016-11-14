import _ from 'lodash';

export default class EventsWebSocket {
  constructor(dispatcher) {
    this.ws = new WebSocket(`ws://${document.location.host}/ws/events`);

    this.ws.onopen = function onopen(v) {
      console.debug('ws connected', v);
    };
    this.ws.onerror = function onerror(err) {
      console.error('ws error', err);
    };
    this.ws.onclose = function onclose(v) {
      console.debug('ws closed', v);
    };

    this.ws.onmessage = function onnmessage(event) {
      const lines = event.data.split('\n');
      const jsonEvents = _.chain(lines).filter(l => l.indexOf('{') === 0).join(',');
      const events = `[${jsonEvents}]`;
      _.forEach(JSON.parse(events), (e => dispatcher(e)));
    };
  }

  close() {
    this.ws.close();
  }

}
