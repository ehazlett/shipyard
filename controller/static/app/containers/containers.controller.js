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
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.restartContainer = restartContainer;
        vm.refresh = refresh;

        intervalFunction();
        ////

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

        function destroyContainer() {
            ContainerService.destroy(vm.selectedContainerId)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function stopContainer(container) {
            ContainerService.stop(container.Id)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }

        function restartContainer(container) {
            ContainerService.restart(container.Id)
                .then(function(data) {
                    vm.refresh();
                }, function(data) {
                    vm.error = data;
                });
        }
    }
})();
