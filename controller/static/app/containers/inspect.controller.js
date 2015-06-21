(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('ContainerController', ContainerController);

	ContainerController.$inject = ['resolvedContainer', 'ContainerService', '$state'];
	function ContainerController(resolvedContainer, ContainerService, $state) {
        var vm = this;
        vm.container = resolvedContainer;
        vm.showDestroyContainerDialog = showDestroyContainerDialog;
        vm.showRestartContainerDialog = showRestartContainerDialog;
        vm.showStopContainerDialog = showStopContainerDialog;
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.restartContainer = restartContainer;
        vm.parseLinkingString = parseLinkingString;
        vm.isEmptyObject = isEmptyObject;
        vm.top;
        vm.stats;
        vm.links = parseContainerLinks(vm.container.HostConfig.Links);

        if(resolvedContainer.State.Running) {
            ContainerService.top(resolvedContainer.Id).then(function(data) {
                vm.top = data
            }, null);
        }

        function parseContainerLinks(links) {
            var l = [];
            if (links == null) {
                return l;
            }
            for (var i=0; i<links.length; i++) {
                var parts = links[i].split(':');
                var link = {
                    container: parts[0].slice(1),
                    link: parts[1].split('/')[2]
                }
                l.push(link)
            }

            return l;
        }

        function parseLinkingString(linkingString) {
            var linkedTo = linkingString.split(':')[0].replace('/','');
            var alias = linkingString.split(':')[1];

            return linkedTo + String.fromCharCode(8594) + alias.substring(alias.lastIndexOf('/')+1, alias.length);
        }

        function isEmptyObject(obj) {
            for (var k in obj) {
                return false;
            }

            return true;
        }

        function showDestroyContainerDialog(container) {
            vm.selectedContainerId = resolvedContainer.Id;
            $('#destroy-modal').modal('show');
        }

        function showRestartContainerDialog(container) {
            vm.selectedContainerId = resolvedContainer.Id;
            $('#restart-modal').modal('show');
        }

        function showStopContainerDialog(container) {
            vm.selectedContainerId = resolvedContainer.Id;
            $('#stop-modal').modal('show');
        }

        function destroyContainer() {
            ContainerService.destroy(vm.selectedContainerId)
                .then(function(data) {
                    $state.transitionTo('dashboard.containers');
                }, function(data) {
                    vm.error = data;
                });
        }

        function stopContainer() {
            ContainerService.stop(vm.selectedContainerId)
                .then(function(data) {
                    $state.reload();
                }, function(data) {
                    vm.error = data;
                });
        }

        function restartContainer() {
            ContainerService.restart(vm.selectedContainerId)
                .then(function(data) {
                    $state.reload();
                }, function(data) {
                    vm.error = data;
                });
        }
	}
})();
