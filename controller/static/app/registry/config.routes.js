(function(){
    'use strict';

    angular
        .module('shipyard.registry')
        .config(getRoutes);

    getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

    function getRoutes($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('dashboard.registry', {
                url:'^/registry',
                templateUrl: 'app/registry/registry.html',
                controller: 'RegistryController', 
                controllerAs: 'vm',
                authenticate: 'true',
                resolve: { 
                    resolvedRepositories: ['RegistryService', '$state', '$stateParams', function(RegistryService, $state, $stateParams) {
                        return RegistryService.list().then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            })
            .state('dashboard.inspectRepository', {
                url: '^/registry/{namespace}/{repository}',
                templateUrl: 'app/registry/repository.html',
                controller: 'RepositoryController',
                controllerAs: 'vm',
                authenticate: true,
                resolve: { 
                    resolvedRepository: ['RegistryService', '$state', '$stateParams', function(RegistryService, $state, $stateParams) {
                        return RegistryService.inspectRepository($stateParams.namespace, $stateParams.repository).then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            });
    }
})();
