import _ from 'lodash';

export default class EventsWebSocket {
  constructor(dispatcher) {
    this.ws = new WebSocket('ws://'+document.location.host+'/ws/events');

    this.ws.onopen = function(v) {
      console.debug('ws connected', v);
    };
    this.ws.onerror = function(err) {
      console.error('ws error', err);
    };
    this.ws.onclose = function(v) {
      console.debug('ws closed', v);
    };

    this.ws.onmessage = function (event) {
      var lines = event.data.split('\n');
      var events = '['
        + _.chain(lines)
        .filter(l => l.indexOf('{') === 0)
        .join(',')
        + ']';

      _.forEach(JSON.parse(events), (e => dispatcher(e)));
    }
  }

  close() {
    this.ws.close();
  }

}
