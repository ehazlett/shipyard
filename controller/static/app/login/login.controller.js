(function(){
	'use strict';

	angular
		.module('shipyard.login')
		.controller('LoginController', LoginController);

    LoginController.$inject = ['AuthService', '$state'];
	function LoginController(AuthService, $state) {
            var vm = this;
            vm.error = "";
            vm.username = "";
            vm.password = "";
            vm.login = login;

            function isValid() {
                return $('.ui.form').form('validate form');
            }

            function login() {
                if (!isValid()) {
                    return;
                }
                vm.error = "";
                AuthService.login({
                    username: vm.username, 
                    password: vm.password
                }).then(function(response) {
                    $state.transitionTo('dashboard.containers');
                }, function(response) {
                    vm.error = response.data;
                });
            }
        }
})();

