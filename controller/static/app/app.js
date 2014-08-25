'use strict';

angular.module('shipyard', ['ngRoute', 'ngCookies', 'shipyard.filters', 'shipyard.services', 'shipyard.controllers', 'shipyard.utils'])
    .config(['$routeProvider', '$httpProvider', '$provide',
        function ($routeProvider, $httpProvider, $provide) {
            $routeProvider.when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'LoginController'
            });
            $routeProvider.when('/logout', {
                template: "",
                controller: 'LogoutController'
            });
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
            $provide.factory('httpInterceptor', function ($q, $location, AuthToken) {
                return {
                    request: function (config) {
                        return config || $q.when(config);
                    },
                    requestError: function (rejection) {
                        return $q.reject(rejection);
                    },
                    response: function (response) {
                        return response || $q.when(response);
                    },
                    responseError: function (rejection) {
                        if (rejection.status == 401) {
                            AuthToken.delete();
                            $window.location.href = '/#/login';
                            $window.location.reload();
                            return $q.reject(rejection);
                        }
                        return $q.reject(rejection);
                    }
                };
            });
            $httpProvider.interceptors.push('httpInterceptor');
        }]);

