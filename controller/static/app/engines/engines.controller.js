(function() {
    'use strict';

    angular
        .module('shipyard')
        .controller('EnginesController', EnginesController);

    EnginesController.$inject = ['$scope', '$location', 'Engines'];    

    function EnginesController($scope, $location, Engines) {

        var vm = this;
        vm.reverseSort = false;
        vm.orderByField = 'engine.id';

        $scope.go = function() {
            $location.path("/engines/" + this.e.id)
        };

        $scope.selectSortColumn = function(field) {
            vm.reverseSort = !vm.reverseSort;
            vm.orderByField = field;
        }

        $scope.sortedTableHeading = function(field) {
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
