(function(){
	'use strict';

	angular
		.module('shipyard', [
			'shipyard.accounts',
			'shipyard.services',
			'shipyard.layout',
			'shipyard.help',
			'shipyard.login',
			'shipyard.containers',
			'shipyard.events',
			'shipyard.registry',
			'shipyard.nodes',
			'shipyard.images',
                        'angular-jwt',
                        'base64',
			'ui.router'
		]);
		
})();
