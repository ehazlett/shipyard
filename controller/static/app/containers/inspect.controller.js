(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('ContainerController', ContainerController);

	ContainerController.$inject = ['resolvedContainer'];
	function ContainerController(resolvedContainer) {
        var vm = this;
        vm.container = resolvedContainer;
	}
})();
