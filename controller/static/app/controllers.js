'use strict';

angular.module('shipyard.controllers', ['ngCookies'])
        .controller('HeaderController', function($http, $scope, AuthToken) {
            $scope.template = 'templates/header.html';
            $scope.username = AuthToken.getUsername();
            $http.defaults.headers.common['X-Access-Token'] = AuthToken.get();
        })
        .controller('MenuController', function($scope, $location, $cookieStore, AuthToken) {
            $scope.template = 'templates/menu.html';
            $scope.isActive = function(path){
                if ($location.path().substr(0, path.length) == path) {
                    return true
                }
                return false
            }
            $scope.isLoggedIn = AuthToken.isLoggedIn();
        })
        .controller('LoginController', function($scope, $cookieStore, $window, flash, Login, AuthToken) {
            $scope.template = 'templates/login.html';
            $scope.login = function() {
                Login.login({username: $scope.username, password: $scope.password}).$promise.then(function(data){
                    AuthToken.save($scope.username, data.auth_token);
                    $window.location.href = '/#/dashboard';
                    $window.location.reload();
                }, function() {
                    flash.error = 'invalid username/password';
                });
            }
        })
        .controller('LogoutController', function($scope, $window, AuthToken) {
            AuthToken.delete();
            $window.location.href = '/#/login';
            $window.location.reload();
        })
        .controller('DashboardController', function($http, $scope, Events, ClusterInfo, AuthToken) {
            $scope.template = 'templates/dashboard.html';
            Events.query(function(data){
                $scope.events = data;
            });
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
            ClusterInfo.query(function(data){
                $scope.clusterInfo = data;
                $scope.clusterCpuData = [
                    { key: "Free", y: data.cpus - data.reserved_cpus },
                    { key: "Reserved", y: data.reserved_cpus }
                ];
                $scope.clusterMemoryData = [
                    { key: "Free", y: data.memory - data.reserved_memory },
                    { key: "Reserved", y: data.reserved_memory }
                ];
            });
        })
        .controller('ContainersController', function($scope, Containers) {
            $scope.template = 'templates/containers.html';
            Containers.query(function(data){
                $scope.containers = data;
            });
        })
        .controller('ContainerDetailsController', function($scope, $routeParams, Container) {
            $scope.template = 'templates/container_details.html';
            $scope.showX = function(){
                return function(d){
                    return d.key;
                };
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
                    l.protocol = p.proto;
                    l.container_port = p.container_port;
                    l.link = h.protocol + '//' + h.hostname + ':' + p.port;
                    this.push(l);
                }, portLinks);
                $scope.portLinks = portLinks;
                $scope.predicate = 'container_port';
                $scope.cpuMax = data.engine.cpus;
                $scope.memoryMax = data.engine.memory;
                $scope.containerCpuData = [
                    {
                        "key": "CPU",
                        "values": [ [$scope.container.image.cpus, $scope.container.image.cpus] ]
                    }
                ];
                $scope.containerMemoryData = [
                    {
                        "key": "Memory",
                        "values": [ [$scope.container.image.memory, $scope.container.image.memory] ]
                    }
                ];
            });
        })
        .controller('EnginesController', function($scope, Engines) {
            $scope.template = 'templates/engines.html';
            Engines.query(function(data){
                $scope.engines = data;
            });
        })
        .controller('EventsController', function($scope, Events) {
            $scope.template = 'templates/events.html';
            Events.query(function(data){
                $scope.events = data;
            });
        })

