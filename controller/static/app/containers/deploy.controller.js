(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerDeployController', ContainerDeployController);

    ContainerDeployController.$inject = ['$http', '$state'];
    function ContainerDeployController($http, $state) {
        var vm = this;
        vm.deploy = deploy;
        vm.containerName = "";
        vm.error = "";
        vm.request = {};

        ////

        function deploy() {
            console.log(vm);
            $http
                .post('/containers/create?name='+vm.containerName, vm.request)
                .success(function(data, status, headers, config) {
                    $state.transitionTo('dashboard.containers');
                })
                .error(function(data, status, headers, config) {
                    console.log(data);
                    vm.error = data;
                });
        }
    }
})();

