(function() {
    'use strict';

    angular
        .module('shipyard.events')
        .config(eventsRoute);

    eventsRoute.$inject = ['$routeProvider'];

    function eventsRoute($routeProvider) {
        $routeProvider.when('/events', {
            templateUrl: 'app/events/events.html',
            controller: 'EventsController',
            controllerAs: 'vm'
        })
    };
})()

