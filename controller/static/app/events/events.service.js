(function(){
	'use strict';

	angular
		.module('shipyard.events')
        .factory('EventsService', EventsService);

	EventsService.$inject = ['$resource'];
	function EventsService($resource) {
            return $resource('/api/events');
	}
})();
