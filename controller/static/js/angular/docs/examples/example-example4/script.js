  angular.module('cacheExampleApp', []).
    controller('CacheController', ['$scope', '$cacheFactory', function($scope, $cacheFactory) {
      $scope.keys = [];
      $scope.cache = $cacheFactory('cacheId');
      $scope.put = function(key, value) {
        $scope.cache.put(key, value);
        $scope.keys.push(key);
      };
    }]);