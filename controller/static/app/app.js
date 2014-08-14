'use strict';

angular.module('shipyard', ['ngRoute', 'shipyard.filters', 'shipyard.services', 'shipyard.controllers'])
    .config(['$routeProvider',
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
            $routeProvider.when('/events', {
                templateUrl: 'templates/events.html',
                controller: 'EventsController'
            });
            $routeProvider.otherwise({
                redirectTo: '/dashboard'
            });
    }]);

