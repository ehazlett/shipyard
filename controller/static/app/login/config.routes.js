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
                .state('403', {
                    url: '/403',
                    templateUrl: 'app/login/403.html',
                    controller: 'AccessDeniedController',
                    controllerAs: 'vm',
                    authenticate: true
                })
                .state('logout', {
                    url: '/logout',
                    controller: 'LogoutController',
                    controllerAs: 'vm',
                    authenticate: true
                });
	}
})();
