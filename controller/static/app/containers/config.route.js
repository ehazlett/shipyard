(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .config(containersRoute);
    containersRoute.$inject = ['$routeProvider'];

    function containersRoute($routeProvider) {
        $routeProvider.when('/containers', {
            templateUrl: 'app/containers/containers.html',
            controller: 'ContainersController',
            controllerAs: 'vm'
        })
    };
})()

