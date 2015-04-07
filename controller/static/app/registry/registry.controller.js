(function(){
	'use strict';

	angular
		.module('shipyard.registry')
		.controller('RegistryController', RegistryController);

	RegistryController.$inject = ['resolvedRepositories', 'RegistryService', '$state', '$timeout'];
	function RegistryController(resolvedRepositories, RegistryService, $state, $timeout) {
            var vm = this;
            vm.registry = resolvedRepositories;
            vm.refresh = refresh

            function refresh() {
                RegistryService.list()
                    .then(function(data) {
                        vm.registry = data; 
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            }

	}
})();
