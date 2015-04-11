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
                        .state('dashboard.addnode', {
                            url: '^/nodes/add',
                            templateUrl: 'app/nodes/add.html',
                            controller: 'NodeAddController',
                            controllerAs: 'vm',
                            authenticate: true
                        });
	}
})();
