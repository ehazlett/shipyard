(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerLogsController', ContainerLogsController);

    ContainerLogsController.$inject = ['$scope', '$location', '$routeParams', '$http', 'flash', 'Container', 'ansi2html'];

    function ContainerLogsController($scope, $location, $routeParams, $http, flash, Container, ansi2html) {
        $http.get('/api/containers/' + $routeParams.id + "/logs").success(function(data){
            $scope.logs = ansi2html.toHtml(data.replace(/\n/g, '<br/>'));
        });
        Container.query({id: $routeParams.id}, function(data){
            $scope.container = data;
        });
    }

})()

