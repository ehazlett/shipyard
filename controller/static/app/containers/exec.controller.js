(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('ExecController', ExecController);

	ExecController.$inject = ['$http', '$stateParams', 'ContainerService'];
	function ExecController($http, $stateParams, ContainerService) {
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
                var cmd = vm.command.replace(" ", ",");

                var url = window.location.href;
                var urlparts = url.split("/");
                var scheme = urlparts[0];
                var wsScheme = "ws";

                if (scheme === "https:") {
                    wsScheme = "wss";
                }

                // we make a request for a console session token; this is used
                // as authentication to make sure the user has console access
                // for this exec session
                $http
                    .get('/api/consolesession/' + vm.id)
                    .success(function(data, status, headers, config) {
                        vm.token = data.token;
                        vm.addr = wsScheme + "://" + window.location.hostname + ":" + window.location.port + "/exec?id=" + vm.id + "&cmd=" + cmd + "&h=" + termHeight + "&w=" + termWidth + "&token=" + vm.token;

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
                                    //console.log(evt)
                                }
                            }
                        }
                    })
                    .error(function(data, status, headers, config) {
                        vm.error = data;
                    });
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
