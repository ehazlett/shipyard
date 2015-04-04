(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('ContainersController', ContainersController);

	ContainersController.$inject = ['containers'];
	function ContainersController(containers) {
		var vm = this;
		vm.containers = containers;
	}
})();
