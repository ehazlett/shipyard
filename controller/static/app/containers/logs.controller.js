(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('LogsController', LogsController);

	LogsController.$inject = ['resolvedLogs'];
	function LogsController(resolvedLogs) {
        var vm = this;
        vm.logs = resolvedLogs;
	}
})();
