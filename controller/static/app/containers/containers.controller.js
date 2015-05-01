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
        vm.showScaleContainerDialog = showScaleContainerDialog;
        vm.destroyContainer = destroyContainer;
        vm.stopContainer = stopContainer;
        vm.restartContainer = restartContainer;
        vm.scaleContainer = scaleContainer;
        vm.refresh = refresh;
        vm.numOfInstances = 1;
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

        function showScaleContainerDialog(container) {
            vm.selectedContainerId = container.Id;
            $('.ui.small.scale.modal').modal('show');
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

        function scaleContainer() {
            ContainerService.scale(vm.selectedContainerId, vm.numOfInstances)
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
