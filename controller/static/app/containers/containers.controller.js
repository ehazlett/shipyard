(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['$location', 'Containers', 'tablesort'];

    function ContainersController($location, Containers, tablesort) {
        var vm = this;
        vm.tablesort = tablesort;

        vm.go = function(container) {
            $location.path("/containers/" + container.id);
        }

        Containers.query(function(data){
            if (data != undefined && data.length == 0) {
                $location.path("/engines");
            }
            vm.containers = data;
        });
    }

})()
