(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['ContainerService', '$state'];
    function ContainersController(ContainerService, $state) {
        var vm = this;
        vm.error = "";
        vm.containers = [];
        vm.selectedContainerId = "";
        vm.showDestroyContainerDialog = showDestroyContainerDialog;
        vm.showRestartContainerDialog = showRestartContainerDialog;
        vm.showStopContainerDialog = showStopContainerDialog;
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.restartContainer = restartContainer;
        vm.refresh = refresh;
        vm.containerStatusText = containerStatusText;
        
        refresh();

        function refresh() {
            ContainerService.list()
                .then(function(data) {
                    vm.containers = data; 
                }, function(data) {
                    vm.error = data;
                });

            vm.error = "";
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
        function containerStatusText(container) {
            if(container.Status.indexOf("Up")==0){
                return "Running";
            }
            else if(container.Status.indexOf("Exited")==0){
                return "Stopped";
            }            
            return "Unknown";
        }   
    }
})();
