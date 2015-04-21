(function(){
    'use strict';

    angular
        .module('shipyard.accounts')
        .controller('AccountsAddController', AccountsAddController);

    AccountsAddController.$inject = ['roles', '$http', '$state'];
    function AccountsAddController(roles, $http, $state) {
        var vm = this;
        vm.request = {};
        vm.addAccount = addAccount;
        vm.username = "";
        vm.password = "";
        vm.firstName = "";
        vm.lastName = "";
        vm.roleName = "user";
        vm.request = null;
        vm.roles = roles;
        vm.userRoles = null;
        vm.roleOptions = roles;
        vm.roleConfig = {
            create: false,
            valueField: 'role_name',
            labelField: 'description',
            delimiter: ',',
            placeholder: 'Select Roles',
            onInitialize: function(selectize){
            },
        };

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
                roles: vm.userRoles
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

