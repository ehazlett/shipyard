(function() {
    angular
        .module('shipyard.containers')
        .controller('ContainersController', ContainersController);

    ContainersController.$inject = ['$location', 'Containers'];    

    function ContainersController($location, Containers) {
        var vm = this;

        vm.orderByField = 'id';
        vm.reverseSort = false;

        vm.go = function(container) {
            $location.path("/containers/" + container.id)
        }

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

        vm.template = 'templates/containers.html';
        Containers.query(function(data){
            vm.containers = data;
        });
    }

})()
