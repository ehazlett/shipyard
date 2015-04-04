(function(){
	'use strict';

	angular
		.module('shipyard.login')
		.config(getRoutes);

	getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

	function getRoutes($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('login', {
				url: '/login',
	            templateUrl: 'app/login/login.html',
	            controller: 'LoginController',
	            controllerAs: 'vm',
                authenticate: false
			})
            .state('logout', {
                url: '/logout',
                controller: 'LogoutController',
                controllerAs: 'vm',
                authenticate: true
            });

	}
})();
