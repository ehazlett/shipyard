window.docker = (function(docker) {
  docker.terminal = {
    startTerminalForContainer: function(container) {
      var term = new Terminal();
      term.open();

      var wsUri = "ws://storagelols:4243/v1.3/containers/" + 
        container + 
        "/attach/ws?logs=1&stderr=1&stdout=1&stream=1&stdin=1";

      var websocket = new WebSocket(wsUri);
      websocket.onopen = function(evt) { onOpen(evt) };
      websocket.onclose = function(evt) { onClose(evt) };
      websocket.onmessage = function(evt) { onMessage(evt) };
      websocket.onerror = function(evt) { onError(evt) };

      term.on('data', function(data) {
        websocket.send(data);
      });

      function onOpen(evt) { 
        term.write("Session started");
      }  

      function onClose(evt) { 
        term.write("Session terminated");
      }  

      function onMessage(evt) { 
        term.write(evt.data);
      }  

      function onError(evt) { 
      }  
    }
  };

  return docker;
})(window.docker || {});

$(function() {
  $("[data-docker-terminal]").each(function(i, el) {
    var container = $(el).data('docker-terminal');
    docker.terminal.startTerminalForContainer(container);
  });
});
