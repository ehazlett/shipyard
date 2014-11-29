(function() {
    'use strict';

    angular
        .module('shipyard.engines')
        .controller('EnginesController', EnginesController);

    EnginesController.$inject = ['$location', 'Engines', 'tablesort'];

    function EnginesController($location, Engines, tablesort) {

        var vm = this;
        vm.tablesort = tablesort;

        vm.go = function(engine) {
            $location.path("/engines/" + engine.id)
        };

        Engines.query(function(data){
            vm.engines = data;
        });
    }
})();
