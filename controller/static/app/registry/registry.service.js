(function(){
	'use strict';

	angular
		.module('shipyard.registry')
        .factory('RegistryService', RegistryService);

	RegistryService.$inject = ['$resource'];
	function RegistryService($resource) {
        return $resource('/api/repositories');
	}
})();
