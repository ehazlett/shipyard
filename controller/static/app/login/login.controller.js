(function(){
	'use strict';

	angular
		.module('shipyard.login')
		.controller('LoginController', LoginController);

    LoginController.$inject = ['AuthService', '$state'];
	function LoginController(AuthService, $state) {
        var vm = this;
        vm.username = "";
        vm.password = "";
        vm.login = login;

        function login() {
            vm.error = "";
            AuthService.login({
                username: vm.username, 
                password: vm.password
            });
        }
    }
})();

