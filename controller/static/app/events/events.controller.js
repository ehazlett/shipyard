(function() {

    angular
        .module('shipyard.events')
        .controller('EventsController', EventsController);

    EventsController.$inject = ['$location', '$window', 'Events', 'tablesort'];

    function EventsController($location, $window, Events, tablesort) {
        var vm = this;
        vm.tablesort = tablesort;

        vm.initSort = function() {
            vm.tablesort.sortBy('time');
            vm.tablesort.setReverseSort(true);
        }

        vm.showPurgeEventsDialog = function() {
            $('.basic.modal.purgeEvents')
                .modal('show');
        };

        vm.purgeEvents = function() {
            Events.purge().$promise.then(function(c) {
                // we must remove the modal or it will come back
                // the next time the modal is shown
                $('.basic.modal').remove();
                $location.path('/events');
                $window.location.reload();
            }, function(err) {
                flash.error = 'error purging events: ' + err.data;
            });
        };

        Events.query(function(data){
            vm.events = data;
        });
    }
})()
