(function(){
	'use strict';

	angular
		.module('shipyard.accounts')
		.config(getRoutes);

	getRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];

	function getRoutes($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('dashboard.accounts', {
			    url: '^/accounts',
			    templateUrl: 'app/accounts/accounts.html',
                            controller: 'AccountsController',
                            controllerAs: 'vm',
                            authenticate: true,
                            resolve: {
                                accounts: ['AccountsService', '$state', '$stateParams', function (AccountsService, $state, $stateParams) {
                                    return AccountsService.list().then(null, function(errorData) {	                            
                                        $state.go('error');
                                    }); 
                                }],
                                roles: ['AccountsService', '$state', '$stateParams', function (AccountsService, $state, $stateParams) {
                                    return AccountsService.roles().then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }] 
                            }
			})
                        .state('dashboard.addAccount', {
                            url: '^/accounts/add',
                            templateUrl: 'app/accounts/add.html',
                            controller: 'AccountsAddController',
                            controllerAs: 'vm',
                            authenticate: true,
                            resolve: {
                                roles: ['AccountsService', '$state', '$stateParams', function (AccountsService, $state, $stateParams) {
                                    return AccountsService.roles().then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }] 
                            }
                        })
                        .state('dashboard.editAccount', {
                            url: '^/accounts/edit/{username}',
                            templateUrl: 'app/accounts/edit.html',
                            controller: 'AccountsEditController',
                            controllerAs: 'vm',
                            authenticate: true,
                            resolve: {
                                account: ['AccountsService', '$state', '$stateParams', function (AccountsService, $state, $stateParams) {
                                    return AccountsService.getAccount($stateParams.username).then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }],
                                roles: ['AccountsService', '$state', '$stateParams', function (AccountsService, $state, $stateParams) {
                                    return AccountsService.roles().then(null, function(errorData) {
                                        $state.go('error');
                                    });
                                }] 
                            }
                        });
	}
})();
