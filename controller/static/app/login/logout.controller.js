(function(){
	'use strict';

	angular
		.module('shipyard.login')
		.controller('LogoutController', LogoutController);

    LogoutController.$inject = ['AuthService', '$state'];
	function LogoutController(AuthService, $state) {
            var vm = this;
            AuthService.logout();
            $state.transitionTo('login');
        }
})();

