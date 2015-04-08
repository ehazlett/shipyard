(function(){
	'use strict';

	angular
		.module('shipyard.registry')
		.controller('RepositoryController', RepositoryController);

	RepositoryController.$inject = ['resolvedRepository'];
	function RepositoryController(resolvedRepository) {
            var vm = this;
            console.log(resolvedRepository);
            vm.selectedRepository = resolvedRepository;
	}
})();
