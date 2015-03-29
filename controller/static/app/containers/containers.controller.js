(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['$location', 'resolveContainers', 'tablesort'];

    function ContainersController($location, resolveContainers, tablesort) {
        var vm = this;
        vm.tablesort = tablesort;
        vm.containers = resolveContainers;

        vm.go = function(container) {
            $location.path("/containers/" + container.id);
        }
    }

})()
