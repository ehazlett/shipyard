(function(){
	'use strict';

	angular
		.module('shipyard', [
			'shipyard.services',
			'shipyard.layout',
			'shipyard.help',
			'shipyard.login',
			'shipyard.containers',
			'shipyard.events',
			'shipyard.registry',
			'shipyard.nodes',
                        'angular-jwt',
                        'base64',
			'ui.router'
		]);
		
})();
