(function(){
	'use strict';

	angular
	    .module('shipyard.login')
	    .controller('AccessDeniedController', AccessDeniedController);

	AccessDeniedController.$inject = ['$stateParams'];
	function AccessDeniedController($stateParams) {
            var vm = this;
	}
})();
