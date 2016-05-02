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
            .state('dashboard.edit_project', {
                url: '^/projects/{id}',
                templateUrl: 'app/projects/edit.html',
                controller: 'EditController',
                controllerAs: 'vm',
                authenticate: true,
                resolve: {
                    resolvedProject: ['ProjectService', '$state', '$stateParams', function(ProjectService, $state, $stateParams) {
                        return ProjectService.edit($stateParams.id).then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            })
            .state('dashboard.create_project', {
                url: '^/projects_create',
                templateUrl: 'app/projects/create.html',
                controller: 'CreateController',
                controllerAs: 'vm',
                authenticate: true
            })
            .state('dashboard.inspect_project', {
                url: '^/inspect/{id}',
                templateUrl: 'app/projects/inspect.html',
                controller: 'InspectController',
                controllerAs: 'vm',
                authenticate: true,
                resolve: {
                    resolvedResults: ['ProjectService', '$state', '$stateParams', function(ProjectService, $state, $stateParams) {
                        return ProjectService.results($stateParams.id).then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            })
            .state('dashboard.buildResults', {
                url: '^/projects/{projectId}/tests/{testId}/builds/{buildId}/results',
                templateUrl: 'app/projects/buildResults.html',
                controller: 'BuildResultsController',
                controllerAs: 'vm',
                authenticate: true,
                resolve: {
                    buildResults: ['ProjectService', '$state', '$stateParams', function(ProjectService, $state, $stateParams) {
                        return ProjectService.buildResults($stateParams.projectId, $stateParams.testId, $stateParams.buildId).then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            })
    }
})();
