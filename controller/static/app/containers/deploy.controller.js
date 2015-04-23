(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerDeployController', ContainerDeployController);

    ContainerDeployController.$inject = ['containers', 'images', '$http', '$state'];
    function ContainerDeployController(containers, images, $http, $state) {
        var vm = this;
        vm.containers = containers;
        vm.images = images;
        vm.deployImages = [];
        vm.containerLinkNames = [];

        // parse out deployable images
        if (vm.images != null) {
            for (var i=0; i<vm.images.length; i++) {
                var img = vm.images[i];
                for (var x=0; x<img.RepoTags.length; x++) {
                    var tag = img.RepoTags[x];
                    if (tag !== "<none>:<none>") {
                        if (vm.deployImages.indexOf(tag) == -1) {
                            vm.deployImages.push(tag);
                        }
                    }
                }
            }

            vm.deployImages.sort();
        }

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
        
        vm.envVars = [];
        vm.variableName = "";
        vm.variableValue = "";
        
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
            },
            Links: [],
            ExposedPorts: {},
            Volumes: {},
            Env: [],
            AttachStdin: false,
            Tty: true,
        };

        vm.deploy = deploy;
        vm.pushVolume = pushVolume;
        vm.deleteVolume = deleteVolume;
        vm.pushLink = pushLink;
        vm.removeLink = removeLink;
        vm.pushEnvVar = pushEnvVar;
        vm.removeEnvVar = removeEnvVar;
        vm.pushPort = pushPort;
        vm.removePort = removePort;

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
                vm.request.HostConfig.PortBindings[vm.containerPort + "/" + vm.protocol.toLowerCase()] = [{ HostIp: vm.hostIp, HostPort: vm.hostPort }];
            }
            for(i = 0; i < vm.ports.length; i++) {
                vm.request.HostConfig.PortBindings[vm.ports[i].ContainerPort + "/" + vm.ports[i].Protocol.toLowerCase()] = [{ HostIp: vm.ports[i].HostIp, HostPort: vm.ports[i].HostPort }];
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
            transformCommand();   
            transformPorts();

            $http
                .post('/containers/create?name='+vm.containerName, vm.request)
                .success(function(data, status, headers, config) {
                    if(status != 200) {
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

