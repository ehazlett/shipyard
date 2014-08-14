'use strict';

angular.module('shipyard.controllers', [])
        .controller('HeaderController', function($scope) {
            $scope.template = 'templates/header.html';
        })
        .controller('MenuController', function($scope, $location) {
            $scope.template = 'templates/menu.html';
            $scope.isActive = function(path){
                if ($location.path().substr(0, path.length) == path) {
                    return true
                }
                return false
            }
        })
        .controller('DashboardController', function($scope, Events, ClusterInfo) {
            $scope.template = 'templates/dashboard.html';
            Events.query(function(data){
                $scope.events = data;
            });;
            ClusterInfo.query(function(data){
                $scope.clusterInfo = data;
                drawDashboardCharts(data.reserved_cpus, data.cpus,
                    data.reserved_memory, data.memory);
            });
        })
        .controller('ContainersController', function($scope, Containers) {
            $scope.template = 'templates/containers.html';
            Containers.query(function(data){
                $scope.containers = data;
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

