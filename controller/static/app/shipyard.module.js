(function(){
	'use strict';

	angular
		.module('shipyard', [
			'shipyard.services',
			'shipyard.layout',
			'shipyard.login',
			'shipyard.containers',
			'shipyard.events',
            'angular-jwt',
			'ui.router'
		]);
		
})();
