(function() {
    'use strict';

    angular
        .module('shipyard.engines')
        .controller('EngineAddController', EngineAddController);

    EngineAddController.$inject = ['$scope', '$location', '$routeParams', 'flash', 'Engines'];

    function EngineAddController($scope, $location, $routeParams, flash, Engines) {
        $scope.id = "";
        $scope.addr = "";
        $scope.cpus = 1.0;
        $scope.memory = 1024;
        $scope.labels = "";
        $scope.ssl_cert = "";
        $scope.ssl_key = "";
        $scope.ca_cert = "";
        $scope.privateRegistry = false;
        $scope.registry_username = "";
        $scope.registry_password = "";
        $scope.registry_email = "";
        $scope.addEngine = function() {
            var valid = $(".ui.form").form('validate form');
            if (!valid) {
                return false;
            }
            
            if (!$scope.privateRegistry) {
                $scope.registry_username = "";
                $scope.registry_password = "";
                $scope.registry_email = "";
            }
            
            var params = {
                engine: {
                    id: $scope.id,
                    addr: $scope.addr,
                    cpus: parseFloat($scope.cpus),
                    memory: parseFloat($scope.memory),
                    labels: $scope.labels.split(" ")
                },
                ssl_cert: $scope.ssl_cert,
                registry_username: $scope.registry_username,
                registry_password: $scope.registry_password,
                registry_email: $scope.registry_email,
                ssl_key: $scope.ssl_key,
                ca_cert: $scope.ca_cert
            };
            Engines.save({}, params).$promise.then(function(c){
                $location.path("/engines");
            }, function(err){
                $scope.error = err.data;
                return false;
            });
        };
    }

})()

