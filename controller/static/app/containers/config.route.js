(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .config(containersRoute);

    containersRoute.$inject = ['$routeProvider'];

    function containersRoute($routeProvider) {
        $routeProvider.when('/containers', {
            templateUrl: 'app/containers/containers.html',
            controller: 'ContainersController',
            controllerAs: 'vm',
            resolve: {
                resolveContainers: ['Containers', '$window', function (Containers, $window) {
                    return Containers.query().$promise.then(null, function(errorData) {
                            $window.location.href = '/#/error';
                            $window.location.reload();
                    }); 
                }] 
            }
        })
        $routeProvider.when('/containers/deploy', {
            templateUrl: 'app/containers/deploy.html',
            controller: 'DeployController',
        });
        $routeProvider.when('/containers/:id', {
            templateUrl: 'app/containers/details.html',
            controller: 'ContainerDetailsController'
        });
        $routeProvider.when('/containers/:id/logs', {
            templateUrl: 'app/containers/logs.html',
            controller: 'ContainerLogsController'
        });
    };

})()

