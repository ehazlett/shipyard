(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['resolvedContainers', 'ContainerService', '$state'];
    function ContainersController(resolvedContainers, ContainerService, $state) {
        var vm = this;
        vm.error = "";
        vm.containers = resolvedContainers;
        vm.selectedContainerId = "";
        vm.showDestroyContainerDialog = showDestroyContainerDialog;
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.restartContainer = restartContainer;

        ////

        function showDestroyContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('.ui.small.destroy.modal').modal('show');
        }

        function destroyContainer() {
            ContainerService.destroy(vm.selectedContainerId)
                .success(function(data, status, headers, config) {
                    $state.reload();
                })
                .error(function(data, status, headers, config) {
                    vm.error = data;
                });
        }

        function stopContainer(container) {
            ContainerService.stop(container.Id)
                .success(function(data, status, headers, config) {
                    $state.reload();
                })
                .error(function(data, status, headers, config) {
                    vm.error = data;
                });
        };

        function restartContainer(container) {
            ContainerService.restart(container.Id)
                .success(function(data, status, headers, config) {
                    $state.reload();
                })
                .error(function(data, status, headers, config) {
                    vm.error = data;
                });
        };

    }
})();
