(function(){
    'use strict';

    angular
        .module('shipyard.nodes')
        .controller('NodeAddController', NodeAddController);

    NodeAddController.$inject = ['$http', '$state', '$base64'];
    function NodeAddController($http, $state, $base64) {
        var vm = this;
        vm.request = {};
        vm.addNode = addNode;
        vm.name = "";
        vm.addr = "";
        vm.request = null;
        vm.tls_ca_cert = null;
        vm.tls_cert = null;
        vm.tls_key = null

        function addNode() {
            var tls_ca_cert, tls_cert, tls_key;
            if (vm.tls_ca_cert != null) {
                tls_ca_cert = $base64.encode(vm.tls_ca_cert);
            }

            if (vm.tls_cert != null) {
                tls_cert = $base64.encode(vm.tls_cert);
            }

            if (vm.tls_key != null) {
                tls_key = $base64.encode(vm.tls_key);
            }
            vm.request = {
                name: vm.name,
                addr: vm.addr,
                tls_ca_cert: tls_ca_cert,
                tls_cert: tls_cert,
                tls_key: tls_key
            }
            $http
                .post('/api/nodes', vm.request)
                .success(function(data, status, headers, config) {
                    $state.transitionTo('dashboard.nodes');
                })
            .error(function(data, status, headers, config) {
                vm.error = data;
                vm.deploying = false;
            });
        }
    }
})();

