(function(){
	'use strict';

	angular
		.module('shipyard.events')
		.config(getRoutes);

	getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

	function getRoutes($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('dashboard.events', {
				url: '^/events',
				templateUrl: 'app/events/events.html',
                controller: 'EventsController',
                controllerAs: 'vm',
                authenticate: true,
                resolve: {
                    events: ['EventsService', '$state', function (EventsService, $state) {
                        return EventsService.query().$promise.then(null, function(errorData) {	                            
                            $state.go('error');
                        }); 
                    }] 
                }
			});
	}
})();
