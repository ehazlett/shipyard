(function(){
	'use strict';

	angular
		.module('shipyard.accounts')
		.controller('AccountsController', AccountsController);

	AccountsController.$inject = ['accounts', 'roles', 'AccountsService', '$state', '$timeout'];
	function AccountsController(accounts, roles, AccountsService, $state, $timeout) {
            var vm = this;
            vm.accounts = accounts;
            vm.refresh = refresh;
            vm.selectedAccount = null;
            vm.removeAccount = removeAccount;
            vm.showRemoveAccountDialog = showRemoveAccountDialog;

            function showRemoveAccountDialog(account) {
                vm.selectedAccount = account;
                $('#remove-modal').modal('show');
            }

            function refresh() {
                AccountsService.list()
                    .then(function(data) {
                        vm.accounts = data; 
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            }

            function removeAccount() {
                AccountsService.removeAccount(vm.selectedAccount)
                    .then(function(data) {
                        vm.refresh();
                    }, function(data) {
                        vm.error = data;
                    });
            }
            
	}
})();
