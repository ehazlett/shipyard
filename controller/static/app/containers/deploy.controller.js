(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerDeployController', ContainerDeployController);

    ContainerDeployController.$inject = ['$http', '$state'];
    function ContainerDeployController($http, $state) {
        var vm = this;
        vm.cmd = "";
        vm.envVars = [];
        vm.variableName = "";
        vm.variableValue = "";
        vm.deploying = false;
        vm.containerName = "";
        vm.error = "";
        vm.request = {
            Env: [],
            AttachStdin: false,
            Tty: true,
        };

        vm.deploy = deploy;
        vm.pushEnvVar = pushEnvVar;

        ////
        
        function pushEnvVar() {
            var envVar = { name: vm.variableName, value: vm.variableValue };
            vm.envVars.push(envVar);
            vm.variableName = "";
            vm.variableValue = "";
        }

        function deploy() {
            vm.deploying = true;
            
            if(vm.cmd.length > 0) {
                vm.request.Cmd = vm.cmd.split(" ");
            }

            var i;
            for(i = 0; i < vm.envVars.length; i++) {
                vm.request.Env.push(vm.envVars[i].name + "=" + vm.envVars[i].value);
            }

            $http
                .post('/containers/create?name='+vm.containerName, vm.request)
                .success(function(data, status, headers, config) {
                    $http
                        .post('/containers/'+ data.Id +'/start', vm.request)
                        .success(function(data, status, headers, config) {
                            $state.transitionTo('dashboard.containers');
                        })
                    .error(function(data, status, headers, config) {
                        vm.error = data;
                        vm.deploying = false;
                    });
                })
            .error(function(data, status, headers, config) {
                vm.error = data;
                vm.deploying = false;
            });
        }

    }
})();

