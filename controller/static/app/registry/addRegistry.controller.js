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
        vm.name = "";
        vm.addr = "";
        vm.request = null;

        function addRegistry() {
            vm.request = {
                name: vm.name,
                addr: vm.addr,
            }
            $http
                .post('/api/registry', vm.request)
                .success(function(data, status, headers, config) {
                    $state.transitionTo('dashboard.registry');
                })
            .error(function(data, status, headers, config) {
                vm.error = data;
            });
        }
    }
})();

