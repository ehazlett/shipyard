(function(){
	'use strict';

	angular
		.module('shipyard.nodes')
		.config(getRoutes);

	getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

	function getRoutes($stateProvider, $urlRouterProvider) {
	    $stateProvider
	        .state('dashboard.nodes', {
	            url: '^/nodes',
	            templateUrl: 'app/nodes/nodes.html',
                    controller: 'NodesController',
                    controllerAs: 'vm',
                    authenticate: 'true',
                    resolve: {
                        nodes: ['NodesService', '$state', '$stateParams', function (NodesService, $state, $stateParams) {
                            return NodesService.list().then(null, function(errorData) {	                            
                                $state.go('error');
                            }); 
                        }] 
                    }
	        })
                .state('dashboard.addNode', {
                    url: '^/nodes/add',
                    templateUrl: 'app/nodes/add.html',
                    controller: 'AddNodeController',
                    controllerAs: 'vm',
                    authenticate: true,
                    resolve: {
                        providers: ['NodesService', '$state', '$stateParams', function (NodesService, $state, $stateParams) {
                            return NodesService.providers().then(null, function(errorData) {	                            
                                $state.go('error');
                            }); 
                        }] 
                    }
                })
                .state('dashboard.launchNode', {
                    url: '^/nodes/launch/{provider}',
                    templateUrl: 'app/nodes/launch.html',
                    controller: 'LaunchNodeController',
                    controllerAs: 'vm',
                    authenticate: true,
                    resolve: {
                        provider: ['NodesService', '$state', '$stateParams', function (NodesService, $state, $stateParams) {
                            return NodesService.provider($stateParams.provider).then(null, function(errorData) {	                            
                                $state.go('error');
                            }); 
                        }] 
                    }
                });
	    }
})();
