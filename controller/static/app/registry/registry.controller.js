(function(){
	'use strict';

	angular
		.module('shipyard.registry')
		.controller('RegistryController', RegistryController);

	RegistryController.$inject = ['registry'];
	function RegistryController(registry) {
        var vm = this;
        vm.registry = registry;
	}
})();
