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
            })
            .state('dashboard.inspect_project', {
                url: '^/projects/{id}',
                templateUrl: 'app/projects/inspect.html',
                controller: 'ProjectController',
                controllerAs: 'vm',
                authenticate: true,
                resolve: {
                    resolvedProject: ['ProjectService', '$state', '$stateParams', function(ProjectService, $state, $stateParams) {
                        return ProjectService.inspect($stateParams.id).then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            });
    }
})();
