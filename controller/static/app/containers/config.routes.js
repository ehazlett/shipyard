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
                    containers: ['ContainersService', '$state', function (ContainersService, $state) {
                        return ContainersService.query().$promise.then(null, function(errorData) {	                            
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
                container: ['$http', '$state', '$stateParams', function($http, $state, $stateParams) {
                    var container = {};
                    return $http
                                .get('/containers/' + $stateParams.id + '/json')
                                .success(function(data, status, headers, config) {
                                    return data;
                                })
                                .error(function(data, status, headers, config) {
                                    $state.go('error');
                                });
                } 
           ]}
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
