(function() {
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerDetailsController', ContainerDetailsController);

    ContainerDetailsController.$inject = ['resolveContainer', '$location', '$routeParams', 'flash', 'Container'];

    function ContainerDetailsController(resolveContainer, $location, $routeParams, flash, Container) {
        var vm = this;
        vm.showX = function(){
            return function(d){
                return d.key;
            };
        };
        vm.showRemoveContainerDialog = function() {
            $('.basic.modal.removeContainer')
                .modal('show');
        };
        vm.showStopContainerDialog = function() {
            $('.basic.modal.stopContainer')
                .modal('show');
        };
        vm.showRestartContainerDialog = function() {
            $('.basic.modal.restartContainer')
                .modal('show');
        };
        vm.showScaleContainerDialog = function() {
            $('.basic.modal.scaleContainer')
                .modal('show');
        };
        vm.destroyContainer = function() {
            Container.destroy({id: $routeParams.id}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path("/containers");
            }, function(err) {
                flash.error = 'error destroying container: ' + err.data;
            });
        };
        vm.stopContainer = function() {
            Container.control({id: $routeParams.id, action: 'stop'}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path("/containers/");
            }, function(err) {
                flash.error = 'error stopping container: ' + err.data;
            });
        };
        vm.restartContainer = function() {
            Container.control({id: $routeParams.id, action: 'restart'}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path("/containers/");
            }, function(err) {
                flash.error = 'error restarting container: ' + err.data;
            });
        };
        vm.showProgress = function() {
            $('.ui.form').addClass('hide');
            $('.progress').removeClass('hide');
        };
        vm.hideProgress = function() {
            $('.ui.form').removeClass('hide');
            $('.progress').addClass('hide');
        };
        vm.scale = function() {
            var valid = $(".ui.form").form('validate form');
            if (!valid) {
                return false;
            }
            vm.showProgress();
            Container.control({id: $routeParams.id, action: 'scale', count: vm.count}).$promise.then(function() {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').modal('hide');
                $('.basic.modal').remove();
                $location.path("/containers");
            }, function(err) {
                flash.error = 'error scaling container: ' + err.data;
                vm.hideProgress();
                $('.basic.modal').modal('hide');
                $('.basic.modal').remove();
            });
        };
        var portLinks = [];
        vm.container = resolveContainer;
        // build port links
        vm.tooltipFunction = function(){
            return function(key, x, y, e, graph) {
                return "<div class='ui block small header'>Reserved</div>" + '<p>' + y + '</p>';
            }
        };
        angular.forEach(resolveContainer.ports, function(p) {
            var h = document.createElement('a');
            h.href = resolveContainer.engine.addr;
            var l = {};
            l.hostname = h.hostname;
            l.protocol = p.proto;
            l.port = p.port;
            l.container_port = p.container_port;
            l.link = 'http://' + h.hostname + ':' + p.port;
            this.push(l);
        }, portLinks);
        vm.portLinks = portLinks;
        vm.predicate = 'container_port';
        vm.cpuMax = resolveContainer.engine.cpus;
        vm.memoryMax = resolveContainer.engine.memory;
        vm.chartOptions = {};
        vm.containerCpuData = {
            labels: ["Reserved"],
            datasets: [
            {
                fillColor: "#6D91AD",
                data: [ vm.container.image.cpus ]
            }
            ]
        };
        vm.containerMemoryData = {
            labels: ["Reserved"],
            datasets: [
            {
                fillColor: "#6D91AD",
                data: [ vm.container.image.memory ]
            }
            ]
        };
    }
})()
