(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('EditController', EditController);

    EditController.$inject = ['resolvedProject', '$scope', 'ProjectService', '$state'];
    function EditController(resolvedProject, $scope, ProjectService, $state) {
        var vm = this;

        vm.project = resolvedProject;

        //TODO: Should the default state be on or off (i.e. checked or not checked)?
        vm.skipImages = false;
        vm.skipTests = false;

        vm.imageList = imageList;
        vm.showScaleContainerDialog = showScaleContainerDialog;
        vm.scaleContainer = scaleContainer;

        function imageList() {
            return Object.keys(vm.project.image_list)
        }

        function showScaleContainerDialog(id) {
            vm.selectedImageId = id;
            $('#scale-modal').modal('show');
        }

        function scaleContainer() {
            ContainerService.scale(vm.selectedContainerId, vm.numOfInstances)
                .then(function(response) {
                    vm.refresh();
                }, function(response) {
                    // Add unique errors to vm.errors
                    $.each(response.data.Errors, function(i, el){
                        if($.inArray(el, vm.errors) === -1) vm.errors.push(el);
                    });
                });
        }
    }
})();
