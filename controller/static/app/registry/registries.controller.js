(function(){
	'use strict';

	angular
		.module('shipyard.registry')
		.controller('RegistriesController', RegistriesController);

	RegistriesController.$inject = ['resolvedRegistries', 'RegistryService', '$state', '$timeout'];
	function RegistriesController(resolvedRegistries, RegistryService, $state, $timeout) {
            var vm = this;
            vm.registries = resolvedRegistries;
            vm.refresh = refresh;
            vm.selectedRegistry = "";
            vm.showRemoveRegistryDialog = showRemoveRegistryDialog;
            vm.removeRegistry = removeRegistry;

            function refresh() {
                RegistryService.list()
                    .then(function(data) {
                        vm.registries = data; 
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            };

            function showRemoveRegistryDialog(registry) {
                vm.selectedRegistry = registry;
                $('.ui.small.remove.modal').modal('show');
            };

            function removeRegistry() {
                RegistryService.removeRegistry(vm.selectedRegistry)
                    .then(function(data) {
                        vm.refresh();
                    }, function(data) {
                        vm.error = data;
                    });
            }
	}
})();
