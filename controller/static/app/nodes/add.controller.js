(function(){
	'use strict';

	angular
		.module('shipyard.nodes')
		.controller('AddNodeController', AddNodeController);

	AddNodeController.$inject = ['providers', 'NodesService', '$state', '$timeout'];
	function AddNodeController(providers, NodesService, $state, $timeout) {
            var vm = this;
            vm.providers = providers;
	}
})();
