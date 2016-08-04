(function(){
    'use strict';

    angular
        .module('shipyard.registry')
        .controller('RegistryAddController', RegistryAddController);

    RegistryAddController.$inject = ['$http', '$state', '$base64'];
    function RegistryAddController($http, $state) {
        var vm = this;
        vm.request = {};
        vm.addRegistry = addRegistry;
        vm.tls = {
            tlsSkipVerify: false
        };
        vm.name = "";
        vm.addr = "";
        vm.username = "";
        vm.password = "";
        vm.request = null;

        function isValid() {
            return $('.ui.form').form('validate form');
        }

        function addRegistry() {
            if (!isValid()) {
                return;
            }
            vm.request = {
                name: vm.name,
                addr: vm.addr,
                username: vm.username,
                password: vm.password,
                tls_skip_verify: vm.tls.tlsSkipVerify
            };
            $http
                .post('/api/registries', vm.request)
                .success(function(data, status, headers, config) {
                    $state.transitionTo('dashboard.registry');
                })
                .error(function(data, status, headers, config) {
                    vm.error = data;
                });
        }
    }
})();

