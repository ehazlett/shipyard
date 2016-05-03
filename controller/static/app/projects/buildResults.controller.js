(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('BuildResultsController', BuildResultsController);

    BuildResultsController.$inject = ['buildResults', '$scope', 'ProjectService', '$stateParams'];
    function BuildResultsController(buildResults, $scope, ProjectService, $stateParams) {
        var vm = this;

        vm.results = buildResults;

    }
})();
