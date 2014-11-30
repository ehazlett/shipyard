(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerDetailsController', ContainerDetailsController);

    ContainerDetailsController.$inject = ['$scope', '$location', '$routeParams', 'flash', 'Container'];

    function ContainerDetailsController($scope, $location, $routeParams, flash, Container) {
        $scope.showX = function(){
            return function(d){
                return d.key;
            };
        };
        $scope.showRemoveContainerDialog = function() {
            $('.basic.modal.removeContainer')
                .modal('show');
        };
        $scope.showStopContainerDialog = function() {
            $('.basic.modal.stopContainer')
                .modal('show');
        };
        $scope.showRestartContainerDialog = function() {
            $('.basic.modal.restartContainer')
                .modal('show');
        };
        $scope.showScaleContainerDialog = function() {
            $('.basic.modal.scaleContainer')
                .modal('show');
        };
        $scope.destroyContainer = function() {
            Container.destroy({id: $routeParams.id}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path("/containers");
            }, function(err) {
                flash.error = 'error destroying container: ' + err.data;
            });
        };
        $scope.stopContainer = function() {
            Container.control({id: $routeParams.id, action: 'stop'}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path("/containers/");
            }, function(err) {
                flash.error = 'error stopping container: ' + err.data;
            });
        };
        $scope.restartContainer = function() {
            Container.control({id: $routeParams.id, action: 'restart'}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path("/containers/");
            }, function(err) {
                flash.error = 'error restarting container: ' + err.data;
            });
        };
        $scope.showProgress = function() {
            $('.ui.form').addClass('hide');
            $('.progress').removeClass('hide');
        };
        $scope.hideProgress = function() {
            $('.ui.form').removeClass('hide');
            $('.progress').addClass('hide');
        };
        $scope.scale = function() {
            var valid = $(".ui.form").form('validate form');
            if (!valid) {
                return false;
            }
            $scope.showProgress();
            Container.control({id: $routeParams.id, action: 'scale', count: $scope.count}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').modal('hide');
                $('.basic.modal').remove();
                $location.path("/containers");
            }, function(err) {
                flash.error = 'error scaling container: ' + err.data;
                $scope.hideProgress();
                $('.basic.modal').modal('hide');
                $('.basic.modal').remove();
            });
        };
        var portLinks = [];
        Container.query({id: $routeParams.id}, function(data){
            $scope.container = data;
            // build port links
            $scope.tooltipFunction = function(){
                return function(key, x, y, e, graph) {
                    return "<div class='ui block small header'>Reserved</div>" + '<p>' + y + '</p>';
                }
            };
            angular.forEach(data.ports, function(p) {
                var h = document.createElement('a');
                h.href = data.engine.addr;
                var l = {};
                l.hostname = h.hostname;
                l.protocol = p.proto;
                l.port = p.port;
                l.container_port = p.container_port;
                l.link = h.protocol + '//' + h.hostname + ':' + p.port;
                this.push(l);
            }, portLinks);
            $scope.portLinks = portLinks;
            $scope.predicate = 'container_port';
            $scope.cpuMax = data.engine.cpus;
            $scope.memoryMax = data.engine.memory;
            $scope.chartOptions = {};
            $scope.containerCpuData = {
                labels: ["Reserved"],
                datasets: [
                {
                    fillColor: "#6D91AD",
                    data: [ $scope.container.image.cpus ]
                }
                ]
            };
            $scope.containerMemoryData = {
                labels: ["Reserved"],
                datasets: [
                {
                    fillColor: "#6D91AD",
                    data: [ $scope.container.image.memory ]
                }
                ]
            };
        });
    }
})()
