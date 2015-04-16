(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('ExecController', ExecController);

	ExecController.$inject = ['$stateParams'];
	function ExecController($stateParams) {
            var vm = this;
            vm.id = $stateParams.id;
            vm.addr = "";
            vm.command = "bash";
            vm.connect = connect;
            vm.disconnect = disconnect;
            var term;
            var websocket;

            function connect() {
                var termWidth = Math.round($(window).width() / 7.5);
                var termHeight = 30;
                var cmd = vm.command.replace(" ", ",")
                vm.addr = "ws://" + window.location.hostname + ":" + window.location.port + "/api/exec?id=" + vm.id + "&cmd=" + cmd + "&h=" + termHeight + "&w=" + termWidth;
                console.log(vm.addr);

                if (term != null) {
                    term.destroy();
                }

                websocket = new WebSocket(vm.addr);

                websocket.onopen = function(evt) {
                    term = new Terminal({
                        cols: termWidth,
                        rows: termHeight,
                        screenKeys: true,
                        useStyle: true,
                        cursorBlink: true,
                    });
                    term.on('data', function(data) {
                        websocket.send(data);
                    });
                    term.on('title', function(title) {
                        document.title = title;
                    });
                    term.open(document.getElementById('container-terminal'));
                    websocket.onmessage = function(evt) {
                        term.write(evt.data);
                    }
                    websocket.onclose = function(evt) {
                        term.write("Session terminated");
                        term.destroy();
                    }
                    websocket.onerror = function(evt) {
                        if (typeof console.log == "function") {
                            console.log(evt)
                        }
                    }
                }
            }

            function disconnect() {
                if (websocket != null) {
                    websocket.close();
                }

                if (term != null) {
                    term.destroy();
                }
            }
	}
})();
