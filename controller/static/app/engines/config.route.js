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
    };
})()
