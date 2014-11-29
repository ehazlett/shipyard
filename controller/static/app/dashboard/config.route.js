(function() {
    'use strict';

    angular
        .module('shipyard.dashboard')
        .config(dashboardRoute);

    dashboardRoute.$inject = ['$routeProvider'];

    function dashboardRoute($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'app/dashboard/dashboard.html',
            controller: 'DashboardController',
            controllerAs: 'vm'
        })
    };
})()

