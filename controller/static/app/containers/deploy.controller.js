(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerDeployController', ContainerDeployController);

    ContainerDeployController.$inject = ['containers', '$http', '$state'];
    function ContainerDeployController(containers, $http, $state) {
        var vm = this;
        vm.containers = containers;
        vm.deployImages = [];
        vm.containerLinkNames = [];

        if (vm.containers != null) {
            for (var i=0; i<vm.containers.length; i++) {
                var c = vm.containers[i];
                var name = c.Names[0].split('/')[2];

                if (vm.containerLinkNames.indexOf(name) == -1) {
                    vm.containerLinkNames.push(name);
                }

            }

            vm.containerLinkNames.sort();
        }

        vm.cmd = "";
        vm.cpuShares = "";
        vm.memory = "";
        
        vm.volumes = [];
        vm.hostPath = "";
        vm.containerPath = "";

        vm.links = [];
        vm.containerToLink = "";
        vm.containerToLinkAlias = "";

        vm.ports = []; 
        vm.hostPort = "";
        vm.containerPort = "";
        vm.protocol = "TCP";

        vm.constraints =[]
        vm.constraintName = "";
        vm.constraintRule = "==";
        vm.constraintValue = "";
        
        vm.envVars = [];
        vm.variableName = "";
        vm.variableValue = "";

        vm.Dns = [];//for dns array
        vm.containerDns = "";//for first input
        
        vm.deploying = false;
        vm.containerName = "";
        vm.error = "";
        vm.request = {
            HostConfig: {
                RestartPolicy: { Name: 'no' },
                Links: [],
                Binds: [],
                Privileged: false,
                PublishAllPorts: false,
                PortBindings: {},
                Dns:[],
            },
            Links: [],
            ExposedPorts: {},
            Volumes: {},
            Env: [],
            AttachStdin: false,
            Tty: true,
        };

        vm.deploy = deploy;
        vm.pushConstraint = pushConstraint;
        vm.removeConstraint = removeConstraint;
        vm.pushVolume = pushVolume;
        vm.deleteVolume = deleteVolume;
        vm.pushLink = pushLink;
        vm.removeLink = removeLink;
        vm.pushEnvVar = pushEnvVar;
        vm.removeEnvVar = removeEnvVar;
        vm.pushPort = pushPort;
        vm.removePort = removePort;
        vm.pushDns = pushDns;
        vm.removeDns = removeDns;

        function pushConstraint() {
            var constraint = {'ConstraintName': vm.constraintName, 'ConstraintValue': vm.constraintValue, 'ConstraintRule': vm.constraintRule};
            vm.constraints.push(constraint);
            vm.constraintName = "";
            vm.constraintValue = "";
            vm.constraintRule = "==";
        }

        function removeConstraint(constraint) {
            var index = vm.constraints.indexOf(removeConstraint);
            vm.constraints.splice(index, 1);
        }

        function pushVolume() {
            var volume = {'HostPath': vm.hostPath, 'ContainerPath': vm.containerPath};
            vm.volumes.push(volume);
            vm.hostPath = "";
            vm.containerPath = "";
        }

        function deleteVolume(volume) {
            var index = vm.volumes.indexOf(volume);
            vm.volumes.splice(index, 1);
        }

        function pushLink() {
            var link = {'ContainerToLink': vm.containerToLink, 'ContainerToLinkAlias': vm.containerToLinkAlias};
            vm.links.push(link);
            vm.containerToLink = "";
            vm.containerToLinkAlias = "";
        }

        function removeLink(link) {
            var index = vm.links.indexOf(link);
            vm.links.splice(index, 1);
        }

        function pushPort() {
            var port = {'Protocol': vm.protocol, 'ContainerPort': vm.containerPort, 'HostIp': vm.hostIp, 'HostPort': vm.hostPort};
            vm.ports.push(port);
            vm.hostPort = "";
            vm.hostIp = "";
            vm.protocol = "TCP";
            vm.containerPort = "";
        }

        function removePort(port) {
            var index = vm.ports.indexOf(port);
            vm.ports.splice(index, 1);
        }

        function pushEnvVar() {
            var envVar = { name: vm.variableName, value: vm.variableValue };
            vm.envVars.push(envVar);
            vm.variableName = "";
            vm.variableValue = "";
        }

        function removeEnvVar(envVar) {
            var index = vm.envVars.indexOf(envVar);
            vm.envVars.splice(index, 1);
        }

        function pushDns() {
            vm.Dns.push(vm.containerDns);
            vm.containerDns = "";
        }

        function removeDns(dns) {
            var index = vm.Dns.indexOf(dns);
            vm.Dns.splice(index, 1);
        }

        function transformLinks() {
            var i;
            if(vm.containerToLink.length > 0) {
                vm.request.HostConfig.Links.push(vm.containerToLink + ":" + vm.containerToLinkAlias);
            }
            for(i = 0; i < vm.links.length; i++) {
                vm.request.HostConfig.Links.push(vm.links[i].ContainerToLink + ":" + vm.links[i].ContainerToLinkAlias);
            }
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

        function transformConstraints() {
            var i;
            if(vm.constraintName.length > 0) {
                vm.request.Env.push("constraint:" + vm.constraintName + vm.constraintRule + vm.constraintValue);
            }

            for(i = 0; i < vm.constraints.length; i++) {
                vm.request.Env.push("constraint:" + vm.constraints[i].ConstraintName + vm.constraints[i].ConstraintRule + vm.constraints[i].ConstraintValue);
            }
        }
        
        function transformCommand() {
            if(vm.cmd.length > 0) {
                vm.request.Cmd = vm.cmd.split(" ");
            }
        }

        function transformVolumes() {
            var i;
            if(vm.hostPath.length > 0) {
                vm.request.HostConfig.Binds.push(vm.hostPath + ":" + vm.containerPath);
            }
            for(i = 0; i < vm.volumes.length; i++) {
                vm.request.HostConfig.Binds.push(vm.volumes[i].HostPath + ":" + vm.volumes[i].ContainerPath);
            }
        }

        function transformRestartPolicy() {
            vm.request.HostConfig.RestartPolicy.Name = translateRestartPolicy(vm.restartPolicy);
        }
            
        function transformPorts() {
            var i;
            if(vm.containerPort.length > 0) {
                // this is used in case there is just a single port and the
                // "+" has not been clicked to push the port onto the array
                pushPort();
            }
            for(i = 0; i < vm.ports.length; i++) {
                var port = vm.ports[i];
                var key = port.ContainerPort + '/' + port.Protocol.toLowerCase();
                vm.request.ExposedPorts[key] = {};
                vm.request.HostConfig.PortBindings[key] = [{ HostIp: port.HostIp, HostPort: port.HostPort }];
            }
        }

        function transformResourceLimits() {
            vm.request.CpuShares = parseInt(vm.cpuShares);
            vm.request.Memory = parseInt(vm.memory) * 1024 * 1024;
        }

        function transformDns() {
            vm.request.HostConfig.Dns = [];
            if(vm.containerDns.length > 0) {
                vm.request.HostConfig.Dns.push(vm.containerDns);
            }
            for(i = 0; i < vm.Dns.length; i++) {
                vm.request.HostConfig.Dns.push(vm.Dns[i]);
            }
        }

        function isFormValid() {
            return $('.ui.form').form('validate form');
        }

        function deploy() {
            if (!isFormValid()) {
                return;
            }
            vm.deploying = true;

            transformVolumes();
            transformLinks();
            transformEnvVars();
            transformConstraints();
            transformCommand();   
            transformPorts();
            transformResourceLimits();
            transformDns();

            $http
                .post('/containers/create?name='+vm.containerName, vm.request)
                .success(function(data, status, headers, config) {
                    if(status >= 400) {
                        vm.error = data;
                        vm.deploying = false;
                        return;
                    }
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

