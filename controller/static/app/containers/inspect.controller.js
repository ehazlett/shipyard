(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('ContainerController', ContainerController);

	ContainerController.$inject = ['container'];
	function ContainerController(container) {
        var vm = this;
        vm.container = container.data;
        console.log(vm.container);
	}
})();
