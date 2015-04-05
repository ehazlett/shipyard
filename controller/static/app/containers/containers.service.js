(function(){
	'use strict';

    angular
        .module('shipyard.containers')
        .factory('ContainersService', ContainersService);

	ContainersService.$inject = ['$resource'];
	function ContainersService($resource) {
        return $resource('/containers/json?all=1');
	}

})();
