'use strict';

angular.module('shipyard.controllers', ['ngCookies'])
        .controller('LoginController', function($scope, $cookieStore, $window, flash, Login, authtoken) {
            $scope.template = 'templates/login.html';
            $scope.login = function() {
                Login.login({username: $scope.username, password: $scope.password}).$promise.then(function(data){
                    authtoken.save($scope.username, data.auth_token);
                    $window.location.href = '/#/dashboard';
                    $window.location.reload();
                }, function() {
                    flash.error = 'invalid username/password';
                });
            }
        })
        .controller('LogoutController', function($scope, $window, authtoken) {
            authtoken.delete();
            $window.location.href = '/#/login';
            $window.location.reload();
        })
        .controller('ContainerDetailsController', function($scope, $location, $routeParams, flash, Container) {
            $scope.template = 'templates/container_details.html';
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
        })
        .controller('ContainerLogsController', function($scope, $location, $routeParams, $http, flash, Container, ansi2html) {
            $scope.template = 'templates/container_logs.html';

            $http.get('/api/containers/' + $routeParams.id + "/logs").success(function(data){
                $scope.logs = ansi2html.toHtml(data.replace(/\n/g, '<br/>'));
            });
            Container.query({id: $routeParams.id}, function(data){
                $scope.container = data;
            });
        })
        .controller('EngineAddController', function($scope, $location, $routeParams, flash, Engines) {
            $scope.template = 'templates/engine_add.html';
            $scope.id = "";
            $scope.addr = "";
            $scope.cpus = 1.0;
            $scope.memory = 1024;
            $scope.labels = "";
            $scope.ssl_cert = "";
            $scope.ssl_key = "";
            $scope.ca_cert = "";
            $scope.addEngine = function() {
                var valid = $(".ui.form").form('validate form');
                if (!valid) {
                    return false;
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
        })
        .controller('EngineDetailsController', function($scope, $location, $routeParams, flash, Containers, Engine) {
            $scope.template = 'templates/engine_details.html';
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
        })

$(function(){
    $('.message .close').on('click', function() {
          $(this).closest('.message').fadeOut();
    });
});
