(function(){
	'use strict';

	angular
		.module('shipyard.registry')
		.controller('RegistryController', RegistryController);

	RegistryController.$inject = ['resolvedRepositories', 'RegistryService', '$state', '$stateParams', '$timeout'];
	function RegistryController(resolvedRepositories, RegistryService, $state, $stateParams, $timeout) {
            var vm = this;
            vm.registryName = $stateParams.name;
            vm.repositories = resolvedRepositories;
            vm.refresh = refresh;
            vm.selectedRepository = null;
            vm.showRemoveRepositoryDialog = showRemoveRepositoryDialog;
            vm.removeRepository = removeRepository;

            function refresh() {
                RegistryService.listRepositories(vm.registryName)
                    .then(function(data) {
                        vm.repositories = data; 
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
                RegistryService.removeRepository(vm.registryName, vm.selectedRepository)
                    .then(function(data) {
                        vm.refresh();
                    }, function(data) {
                        vm.error = data;
                    });
            }
	}
})();
