(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('EditController', EditController);

    EditController.$inject = ['resolvedProject', '$scope', 'ProjectService', '$state'];
    function EditController(resolvedProject, $scope, ProjectService, $state) {
        var vm = this;

        vm.project = resolvedProject;
        vm.skipImages = true;
        vm.skipTests = true;

        vm.imageList = imageList;

        function imageList() {
            return Object.keys(vm.project.image_list)
        }
    }
})();
