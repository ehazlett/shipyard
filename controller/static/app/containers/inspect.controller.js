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
        vm.top;
        vm.stats;

        ContainerService.top(resolvedContainer.Id).then(function(data) {
            vm.top = data
        }, null);

        function showDestroyContainerDialog(container) {
            vm.selectedContainerId = resolvedContainer.Id;
            $('.ui.small.destroy.modal').modal('show');
        }

        function showRestartContainerDialog(container) {
            vm.selectedContainerId = resolvedContainer.Id;
            $('.ui.small.restart.modal').modal('show');
        }

        function showStopContainerDialog(container) {
            vm.selectedContainerId = resolvedContainer.Id;
            $('.ui.small.stop.modal').modal('show');
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
