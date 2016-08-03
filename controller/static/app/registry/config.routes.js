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
                templateUrl: 'app/registry/registries.html',
                controller: 'RegistriesController', 
                controllerAs: 'vm',
                authenticate: 'true',
                resolve: { 
                    resolvedRegistries: ['RegistryService', '$state', '$stateParams', function(RegistryService, $state, $stateParams) {
                        return RegistryService.list().then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            })
            .state('dashboard.addRegistry', {
                url:'^/registry/add',
                templateUrl: 'app/registry/addRegistry.html',
                controller: 'RegistryAddController', 
                controllerAs: 'vm',
                authenticate: 'true'
            })
            .state('dashboard.inspectRegistry', {
                url:'^/registry/{id}',
                templateUrl: 'app/registry/registry.html',
                controller: 'RegistryController', 
                controllerAs: 'vm',
                authenticate: 'true',
                resolve: { 
                    resolvedRepositories: ['RegistryService', '$state', '$stateParams', function(RegistryService, $state, $stateParams) {
                        return RegistryService.listRepositories($stateParams.id).then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            })
            .state('dashboard.inspectRepository', {
                url: '^/registry/{registryId}/repository/{repositoryName}:{repositoryTag}',
                templateUrl: 'app/registry/repository.html',
                controller: 'RepositoryController',
                controllerAs: 'vm',
                authenticate: true,
                resolve: { 
                    resolvedRepository: ['RegistryService', '$state', '$stateParams', function(RegistryService, $state, $stateParams) {
                        return RegistryService.inspectRepository($stateParams.registryId, $stateParams.repositoryName, $stateParams.repositoryTag).then(null, function(errorData) {
                            $state.go('error');
                        });
                    }]
                }
            });
    }
})();
