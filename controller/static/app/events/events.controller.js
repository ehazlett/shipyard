(function() {

    angular
        .module('shipyard.events')
        .controller('EventsController', EventsController);
       
    EventsController.$inject = ['$location', '$window', 'Events'];

    function EventsController($location, $window, Events) {
        var vm = this;

        vm.orderByField = 'time';
        vm.reverseSort = true;

        vm.selectSortColumn = function(field) {
            vm.reverseSort = !vm.reverseSort;
            vm.orderByField = field;
        }

        vm.sortedTableHeading = function(field) {
            if(vm.orderByField != field) {
                return "";
            } else {
                if(vm.reverseSort == true) {
                    return "descending";
                } else {
                    return "ascending";
                }
            }
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
