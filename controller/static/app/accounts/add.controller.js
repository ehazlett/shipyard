(function(){
    'use strict';

    angular
        .module('shipyard.accounts')
        .controller('AccountsAddController', AccountsAddController);

    AccountsAddController.$inject = ['$http', '$state'];
    function AccountsAddController($http, $state) {
        var vm = this;
        vm.request = {};
        vm.addAccount = addAccount;
        vm.username = "";
        vm.password = "";
        vm.firstName = "";
        vm.lastName = "";
        vm.roleName = "user";
        vm.request = null;

        function isValid() {
            return $('.ui.form').form('validate form');
        }

        function addAccount() {
            if (!isValid()) {
                return;
            }
            vm.request = {
                username: vm.username,
                password: vm.password,
                first_name: vm.firstName,
                last_name: vm.lastName,
                role: {
                    "name": vm.role_name
                }
            }
            $http
                .post('/api/accounts', vm.request)
                .success(function(data, status, headers, config) {
                    $state.transitionTo('dashboard.accounts');
                })
            .error(function(data, status, headers, config) {
                vm.error = data;
            });
        }
    }
})();

