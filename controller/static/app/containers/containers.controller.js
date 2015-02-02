(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['$location', 'resolveContainers', 'Container', 'tablesort', 'flash', '$route', '$scope'];

    function ContainersController($location, resolveContainers, Container, tablesort, flash, $route, $scope) {
        var vm = this;
        vm.tablesort = tablesort;
        vm.containers = resolveContainers;
        vm.activeContainer = null;

        vm.showDestroyContainerDialog = function(container) {
            vm.activeContainer = container;
            $('.basic.modal.removeContainer')
                .modal('show');
        };
        vm.showStopContainerDialog = function(container) {
            vm.activeContainer = container;
            $('.basic.modal.stopContainer')
                .modal('show');
        };
        vm.showRestartContainerDialog = function(container) {
            vm.activeContainer = container;
            $('.basic.modal.restartContainer')
                .modal('show');
        };

        vm.showScaleContainerDialog = function(container) {
            vm.activeContainer = container;
            $('.basic.modal.scaleContainer')
                .modal('show');
        };

        vm.destroyContainer = function(container) {
            Container.destroy({id: container.id}).$promise.then(function() {
                $route.reload();
            }, function(err) {
                flash.error = 'error destroying container: ' + err.data;
            });
        };

        vm.stopContainer = function(container) {
            Container.control({id: container.id, action: 'stop'}).$promise.then(function() {
                $route.reload();
            }, function(err) {
                flash.error = 'error stopping container: ' + err.data;
            });
        };

        vm.restartContainer = function(container) {
            Container.control({id: container.id, action: 'restart'}).$promise.then(function() {
                $route.reload();
            }, function(err) {
                flash.error = 'error restarting container: ' + err.data;
            });
        };
        vm.showProgress = function() {
            $('.ui.form').addClass('hide');
            $('.progress').removeClass('hide');
        };
        vm.hideProgress = function() {
            $('.ui.form').removeClass('hide');
            $('.progress').addClass('hide');
        };
        vm.scaleContainer = function(container) {
            vm.showProgress();
            Container.control({id: container.id, action: 'scale', count: $scope.count}).$promise.then(function() {
                $route.reload();
            }, function(err) {
                flash.error = 'error scaling container: ' + err.data;
                vm.hideProgress();
                $('.basic.modal').modal('hide');
                $('.basic.modal').remove();
            });
        }
    }

})()
