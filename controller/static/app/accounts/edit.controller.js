(function(){
    'use strict';

    angular
        .module('shipyard.accounts')
        .controller('AccountsEditController', AccountsEditController);

    AccountsEditController.$inject = ['account', '$http', '$state'];
    function AccountsEditController(account, $http, $state) {
        var vm = this;
        vm.account = account;
        vm.editAccount = editAccount;
        vm.request = {};
        vm.password = null;
        vm.firstName = account.first_name;
        vm.lastName = account.last_name;
        vm.request = null;

        function isValid() {
            return $('.ui.form').form('validate form');
        }

        function editAccount() {
            if (!isValid()) {
                return;
            }
            vm.request = {
                username: account.username,
                password: vm.password,
                first_name: vm.firstName,
                last_name: vm.lastName
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

