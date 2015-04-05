(function(){
	'use strict';

	angular
		.module('shipyard.events')
		.controller('EventsController', EventsController);

	EventsController.$inject = ['events'];
	function EventsController(events) {
        var vm = this;
        vm.events = events;
	}
})();
