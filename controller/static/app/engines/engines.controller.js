(function() {
    'use strict';

    angular
        .module('shipyard')
        .controller('EnginesController', EnginesController);

    EnginesController.$inject = ['$location', 'Engines'];    

    function EnginesController($location, Engines) {

        var vm = this;
        vm.reverseSort = false;
        vm.orderByField = 'engine.id';

        vm.go = function(engine) {
            $location.path("/engines/" + engine.id)
        };

        vm.selectSortColumn = function(field) {
            vm.reverseSort = !vm.reverseSort;
            vm.orderByField = field;
        }

        vm.sortedTableHeading = function(field) {
            if(vm.orderByField != field) {
                return "";
            } else {
                if(vm.reverseSort == true) {
                    return "descending"
                } else {
                    return "ascending";
                }
            }
        }
        
        Engines.query(function(data){
            vm.engines = data;
        });
    }
})();
