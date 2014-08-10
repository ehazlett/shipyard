  angular.module('switchExample', ['ngAnimate'])
    .controller('ExampleController', ['$scope', function($scope) {
      $scope.items = ['settings', 'home', 'other'];
      $scope.selection = $scope.items[0];
    }]);