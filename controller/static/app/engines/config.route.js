(function() {
    'use strict';

    angular
        .module('shipyard.engines')
        .config(enginesRoute);

    enginesRoute.$inject = ['$routeProvider'];

    function enginesRoute($routeProvider) {
        $routeProvider.when('/engines', {
            templateUrl: 'app/engines/engines.html',
            controller: 'EnginesController',
            controllerAs: 'vm'
        })
        $routeProvider.when('/engines/add', {
            templateUrl: 'app/engines/add.html',
            controller: 'EngineAddController'
        });
        $routeProvider.when('/engines/:id', {
            templateUrl: 'app/engines/details.html',
            controller: 'EngineDetailsController'
        });
    };
})()
