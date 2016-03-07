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
    }
})();
