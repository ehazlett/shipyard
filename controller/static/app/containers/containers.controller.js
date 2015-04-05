(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['containers', '$http', '$state'];
    function ContainersController(containers, $http, $state) {
        var vm = this;
        vm.error = "";
        vm.containers = containers;
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
            $http
                .delete('/containers/' + vm.selectedContainerId)
                .success(function(data, status, headers, config) {
                    $state.reload();
                })
                .error(function(data, status, headers, config) {
                    vm.error = data;
                });
        }

        function stopContainer(container) {
            $http
                .post('/containers/' + container.Id + '/stop')
                .success(function(data, status, headers, config) {
                    $state.reload();
                })
                .error(function(data, status, headers, config) {
                    vm.error = data;
                });
        };

        function restartContainer(container) {
            $http
                .post('/containers/' + container.Id + '/restart')
                .success(function(data, status, headers, config) {
                    $state.reload();
                })
                .error(function(data, status, headers, config) {
                    vm.error = data;
                });
        };

    }
})();
