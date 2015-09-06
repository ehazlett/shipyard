(function() {
	'use strict';

	angular
		.module('shipyard.help')
		.config(getRoutes);

	getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

	function getRoutes($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('dashboard.help', {
				url: '^/help',
				templateUrl: 'app/help/help.html',
                authenticate: true
			});
	}
})();
