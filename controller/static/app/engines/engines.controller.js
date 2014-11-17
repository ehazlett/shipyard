(function() {
    'use strict';

    angular
        .module('shipyard')
        .controller('EnginesController', function($scope, $location, Engines) {
            $scope.orderByField = 'engine.id';
            $scope.reverseSort = false;

            $scope.go = function() {
                $location.path("/engines/" + this.e.id)
            };

            $scope.selectSortColumn = function(field) {
                $scope.reverseSort = !$scope.reverseSort;
                $scope.orderByField = field;
            }

            $scope.sortedTableHeading = function(field) {
                if($scope.orderByField != field) {
                    return "";
                } else {
                    if($scope.reverseSort == true) {
                        return "descending"
                    } else {
                        return "ascending";
                    }
                }
            }
            
            $scope.template = 'app/engines/engines.html';
            Engines.query(function(data){
                $scope.engines = data;
            });
        });
})();
