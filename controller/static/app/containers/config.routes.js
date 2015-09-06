(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .config(getRoutes);

    getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

    function getRoutes($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('dashboard.containers', {
                url: '^/containers',
                templateUrl: 'app/containers/containers.html',
                controller: 'ContainersController',
                controllerAs: 'vm',
                authenticate: true
            })
        .state('dashboard.inspect', {
            url: '^/containers/{id}',
            templateUrl: 'app/containers/inspect.html',
            controller: 'ContainerController',
            controllerAs: 'vm',
            authenticate: true,
            resolve: {
                resolvedContainer: ['ContainerService', '$state', '$stateParams', function(ContainerService, $state, $stateParams) {
                    return ContainerService.inspect($stateParams.id).then(null, function(errorData) {
                        $state.go('error');
                    });
                }]
            }
        })
        .state('dashboard.deploy', {
            url: '^/deploy',
            templateUrl: 'app/containers/deploy.html',
            controller: 'ContainerDeployController',
            controllerAs: 'vm',
            authenticate: true,
            resolve: {
                containers: ['ContainerService', '$state', '$stateParams', function(ContainerService, $state, $stateParams) {
                    return ContainerService.list().then(null, function(errorData) {
                        $state.go('error');
                    });
                }]
            }
        })
        .state('dashboard.exec', {
            url: '^/exec/{id}',
            templateUrl: 'app/containers/exec.html',
            controller: 'ExecController',
            controllerAs: 'vm',
            authenticate: true
        })
        .state('dashboard.stats', {
            url:'^/containers/{id}/stats',
            templateUrl: 'app/containers/stats.html',
            controller: 'ContainerStatsController',
            controllerAs: 'vm',
            authenticate: true
        })
        .state('dashboard.logs', {
            url:'^/containers/{id}/logs',
            templateUrl: 'app/containers/logs.html',
            controller: 'LogsController', 
            controllerAs: 'vm',
            authenticate: 'true',
            resolve: {
                resolvedLogs: ['ContainerService', '$state', '$stateParams', function(ContainerService, $state, $stateParams) {
                    return ContainerService.logs($stateParams.id).then(null, function(errorData) {
                        $state.go('error');
                    });
                }]
            }
        });
    }
})();
