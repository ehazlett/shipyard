(function() {
    'use strict';

    angular
        .module('shipyard.engines')
        .controller('EnginesController', EnginesController);

    EnginesController.$inject = ['$location', 'Engines', 'tablesort'];    

    function EnginesController($location, Engines, tablesort) {

        var vm = this;

        vm.reverseSort = tablesort.isReverseSorted();
        vm.orderByField = tablesort.getSortField(); 

        vm.go = function(engine) {
            $location.path("/engines/" + engine.id)
        };

        vm.selectSortColumn = function(field) {
            tablesort.sortBy(field);
        }

        vm.sortedTableHeading = function(field) {
            return tablesort.semanticHeaderClass(field);
        }
        
        Engines.query(function(data){
            vm.engines = data;
        });
    }
})();
