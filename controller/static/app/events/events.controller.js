(function(){
	'use strict';

	angular
		.module('shipyard.events')
		.controller('EventsController', EventsController);

	EventsController.$inject = ['events', 'EventsService'];
	function EventsController(events, EventsService) {
            var vm = this;
            vm.events = events;
            vm.refresh = refresh;
            vm.showClearEventsDialog = showClearEventsDialog;
            vm.clearEvents = clearEvents;

            function showClearEventsDialog() {
                $('#clear-modal').modal('show');
            };

            function clearEvents() {
                EventsService.remove().$promise
                    .then(function(data) {
                        refresh();
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            }

            function refresh() {
                EventsService.query().$promise
                    .then(function(data) {
                        vm.events = data; 
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            }
	}
})();
