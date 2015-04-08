(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerDeployController', ContainerDeployController);

    ContainerDeployController.$inject = ['$http', '$state'];
    function ContainerDeployController($http, $state) {
        var vm = this;
        vm.cmd = "";
        vm.ports = []; 
        vm.hostPort = "";
        vm.containerPort = "";
        vm.protocol = "";
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
        vm.pushPort = pushPort;

        function pushPort() {
            var port = {'ContainerPort': vm.containerPort, 'HostIp': vm.hostIp, 'HostPort': vm.hostPort};
            vm.ports.push(port);
            vm.hostPort = "";
            vm.containerPort = "";
        }

        function pushEnvVar() {
            var envVar = { name: vm.variableName, value: vm.variableValue };
            vm.envVars.push(envVar);
            vm.variableName = "";
            vm.variableValue = "";
        }

        function transformEnvVars() {
            var i;
            if(vm.variableName.length > 0) {
                vm.request.Env.push(vm.variableName + "=" + vm.variableValue);
            }
            for(i = 0; i < vm.envVars.length; i++) {
                vm.request.Env.push(vm.envVars[i].name + "=" + vm.envVars[i].value);
            }
        }
        
        function transformCommand() {
            if(vm.cmd.length > 0) {
                vm.request.Cmd = vm.cmd.split(" ");
            }
        }

        function deploy() {
            vm.deploying = true;
            transformEnvVars();
            transformCommand();   

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

