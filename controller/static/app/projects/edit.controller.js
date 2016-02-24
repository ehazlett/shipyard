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

        vm.selected = {};
        vm.selectedItemCount = 0;

        vm.imageList = imageList;
        vm.showScaleContainerDialog = showScaleContainerDialog;
        vm.scaleContainer = scaleContainer;

        $scope.$on('ngRepeatFinished', function() {
            $('.ui.sortable.celled.table').tablesort();
        });

        $scope.$watch(function() {
            var count = 0;
            angular.forEach(vm.selected, function (s) {
                if(s.Selected) {
                    count += 1;
                }
            });
            vm.selectedItemCount = count;
        });

        // Remove selected items that are no longer visible
        $scope.$watchCollection('imageList()', function () {
            angular.forEach(vm.selected, function (s) {
                if(vm.selected[s.Id].Selected == true) {
                    var isVisible = false
                    angular.forEach($scope.imageList(), function(c) {
                        if(c.Id == s.Id) {
                            isVisible = true;
                            return;
                        }
                    });
                    vm.selected[s.Id].Selected = isVisible;
                }
            });
            return;
        });

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
