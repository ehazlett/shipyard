(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .config(getRoutes);

    getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

    function getRoutes($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('dashboard.projects', {
                url: '^/projects',
                templateUrl: 'app/projects/projects.html',
                controller: 'ProjectsController',
                controllerAs: 'vm',
                authenticate: true
            });
    }
})();
