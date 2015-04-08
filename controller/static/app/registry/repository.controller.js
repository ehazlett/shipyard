(function(){
	'use strict';

	angular
		.module('shipyard.registry')
		.controller('RepositoryController', RepositoryController);

	RepositoryController.$inject = ['resolvedRepository', 'RepositoryService', '$state', '$timeout'];
	function RepositoryController(namespace, repository, RepositoryService, $state, $timeout) {
            var vm = this;
            vm.selectedRepository = "";
	}
})();
