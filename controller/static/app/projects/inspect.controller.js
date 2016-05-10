(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('InspectController', InspectController);

    InspectController.$inject = ['resolvedResults', '$scope', 'ProjectService', 'RegistryService', '$stateParams'];
    function InspectController(resolvedResults, $scope, ProjectService, RegistryService, $stateParams) {
        var vm = this;

        vm.showProjectHistory = showProjectHistory;
        vm.testResults = testResults;

        vm.results = resolvedResults;
        angular.forEach(vm.results.testResults, function (result, key) {
            testResults(vm.results.projectId,result.testId,result.buildId).then(function (response) {
                vm.results[key].istestResult = response;
            })
        });

        function showProjectHistory() {
            $('#inspect-project-history-' + vm.results.projectId)
                .sidebar('toggle')
            ;
        }

        function testResults(projectId, testId, buildId) {
            return ProjectService.buildResults(projectId, testId, buildId)
                .then(function(data) {
                    return true;
                }, function(data) {
                    return false;
                });
        }
    }
})();
