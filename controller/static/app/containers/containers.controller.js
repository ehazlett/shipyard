(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['resolvedContainers', 'ContainerService', '$state', '$timeout'];
    function ContainersController(resolvedContainers, ContainerService, $state, $timeout) {
        var vm = this;
        vm.error = "";
        vm.containers = resolvedContainers;
        vm.selectedContainerId = "";
        vm.showDestroyContainerDialog = showDestroyContainerDialog;
        vm.showRestartContainerDialog = showRestartContainerDialog;
        vm.showStopContainerDialog = showStopContainerDialog;
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.restartContainer = restartContainer;
        vm.refresh = refresh;

        intervalFunction();

        function refresh() {
            ContainerService.list()
                .then(function(data) {
                    vm.containers = data; 
                }, function(data) {
                    vm.error = data;
                });

            vm.error = "";
        }

        function intervalFunction() {
            $timeout(function() {
                vm.refresh();
                intervalFunction();
            }, 30000);
        }

        function showDestroyContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('.ui.small.destroy.modal').modal('show');
        }

        function showRestartContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('.ui.small.restart.modal').modal('show');
        }

        function showStopContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('.ui.small.stop.modal').modal('show');
        }

        function destroyContainer() {
            ContainerService.destroy(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function stopContainer() {
            ContainerService.stop(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function restartContainer() {
            ContainerService.restart(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }
    }
})();
