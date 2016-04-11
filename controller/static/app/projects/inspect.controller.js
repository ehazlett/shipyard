(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('InspectController', InspectController);

    InspectController.$inject = ['resolvedResults', '$scope', 'ProjectService', 'RegistryService', '$stateParams'];
    function InspectController(resolvedResults, $scope, ProjectService, RegistryService, $stateParams) {
        var vm = this;

        vm.showProjectHistory = showProjectHistory;

        vm.results = resolvedResults;

        function showProjectHistory() {
            $('#inspect-project-history-' + vm.results.projectId)
                .sidebar('toggle')
            ;
        }
    }
})();
