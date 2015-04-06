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
                authenticate: true,
                resolve: {
                    resolvedContainers: ['ContainerService', '$state', function (ContainerService, $state) {
                        return ContainerService.list().then(null, function(errorData) {	                            
                            $state.go('error');
                        }); 
                    }] 
                }
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
            authenticate: true
        });
    }
})();
