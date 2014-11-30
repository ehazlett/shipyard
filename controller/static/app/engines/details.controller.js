(function() {
    'use strict';

    angular
        .module('shipyard.engines')
        .controller('EngineDetailsController', EngineDetailsController);

    EngineDetailsController.$inject = ['$scope', '$location', '$routeParams', 'flash', 'Containers', 'Engine'];

    function EngineDetailsController($scope, $location, $routeParams, flash, Containers, Engine) {
        $scope.showX = function(){
            return function(d){
                return d.key;
            };
        };
        $scope.showY = function(){
            return function(d){
                return d.y;
            };
        };
        $scope.showRemoveEngineDialog = function() {
            $('.basic.modal')
                .modal('show');
        };
        $scope.removeEngine = function() {
            Engine.remove({id: $routeParams.id}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path("/engines");
            }, function(err) {
                flash.error = 'error removing engine: ' + err.data;
            });
        };
        Engine.query({id: $routeParams.id}, function(data){
            $scope.engine = data;
            // load container data
            Containers.query(function(d){
                var cpuData = [];
                var memoryData = [];
                $scope.chartOptions = {};
                for (var i=0; i<d.length; i++) {
                    var c = d[i];
                    var color = getRandomColor();
                    if (c.engine.id == data.engine.id){
                        var x = {
                            label: c.image.hostname,
                            value: c.image.cpus || 0.0,
                            color: color
                        }
                        var y = {
                            label: c.image.hostname,
                            value: c.image.memory || 0.0,
                            color: color
                        }
                        cpuData.push(x);
                        memoryData.push(y);
                    }
                }
                $scope.engineCpuData = cpuData;
                $scope.engineMemoryData = memoryData;
            });
        });
    }
})()

