(function(){
	'use strict';

	angular
		.module('shipyard.registry')
		.controller('RegistryController', RegistryController);

	RegistryController.$inject = ['resolvedRepositories', 'RegistryService', '$state', '$timeout'];
	function RegistryController(resolvedRepositories, RegistryService, $state, $timeout) {
            var vm = this;
            vm.registry = resolvedRepositories;
            vm.refresh = refresh;
            vm.selectedRepository = "";
            vm.showRemoveRepositoryDialog = showRemoveRepositoryDialog;
            vm.removeRepository = removeRepository;

            function refresh() {
                RegistryService.list()
                    .then(function(data) {
                        vm.registry = data; 
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            };

            function showRemoveRepositoryDialog(repo) {
                vm.selectedRepository = repo;
                $('.ui.small.remove.modal').modal('show');
            };

            function removeRepository() {
                RegistryService.removeRepository(vm.selectedRepository)
                    .then(function(data) {
                        vm.refresh();
                    }, function(data) {
                        vm.error = data;
                    });
            }


	}
})();
