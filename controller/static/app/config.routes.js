(function() {
    'use strict';

    angular
        .module('shipyard')
        .config(getRoutes);

    getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

    function getRoutes($stateProvider, $urlRouterProvider) {	
        $stateProvider
            .state('error', {
                templateUrl: 'app/error/error.html',
                authenticate: false
            });
        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get('$state');
            $state.go('dashboard.containers');
        });
    }
})();
