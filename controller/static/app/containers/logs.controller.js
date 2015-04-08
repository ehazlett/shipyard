(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('LogsController', LogsController);

	LogsController.$inject = ['resolvedLogs'];
	function LogsController(resolvedLogs) {
        var vm = this;
        // ASCII is in range of 0 to 127, so strip anything not in that range
        vm.logs = resolvedLogs.replace(/[^\x00-\x7F]/g, "");
	}
})();
