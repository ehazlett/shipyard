(function() {
    'use strict';

    angular
        .module('shipyard')
        .config(getRoutes);

    getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

    function getRoutes($stateProvider, $urlRouterProvider) {	
        $stateProvider
            .state('error', {
                url: '/error',
                templateUrl: 'app/error/error.html',
                authenticate: false
            });

        $urlRouterProvider.otherwise('/containers');
    }
})();
