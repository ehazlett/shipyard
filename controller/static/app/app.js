'use strict';
var shipyardApp = angular.module('shipyard', ['ngRoute', 'shipyard.services']);

shipyardApp.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.when('/dashboard', {
                templateUrl: 'templates/dashboard.html',
                controller: 'DashboardController'
            });
            $routeProvider.when('/containers', {
                templateUrl: 'templates/containers.html',
                controller: 'ContainersController'
            });
            $routeProvider.when('/engines', {
                templateUrl: 'templates/engines.html',
                controller: 'EnginesController'
            });
            $routeProvider.otherwise({
                redirectTo: '/dashboard'
            });
    }]);

shipyardApp.controller('HeaderController', function($scope) {
    $scope.template = 'templates/header.html';
});

shipyardApp.controller('MenuController', function($scope, $location) {
    $scope.template = 'templates/menu.html';
    $scope.isActive = function(path){
        if ($location.path().substr(0, path.length) == path) {
            return true
        }
        return false
    }
});

shipyardApp.controller('DashboardController', function($scope) {
    $scope.template = 'templates/dashboard.html';
    $scope.active = true;
});

shipyardApp.controller('ContainersController', function($scope) {
    $scope.template = 'templates/containers.html';
});

shipyardApp.controller('EnginesController', function($scope) {
    $scope.template = 'templates/engines.html';
});
