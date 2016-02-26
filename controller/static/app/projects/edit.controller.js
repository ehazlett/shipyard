(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('EditController', EditController);

    EditController.$inject = ['resolvedProject', '$scope', 'ProjectService', '$state'];
    function EditController(resolvedProject, $scope, ProjectService, $state) {
        var vm = this;

        vm.project = resolvedProject;
        vm.project.author = localStorage.getItem('X-Access-Token').split(":")[0];

        //TODO: Should the default state be on or off (i.e. checked or not checked)?
        vm.skipImages = false;
        vm.skipTests = false;

        vm.needsBuild = false;

        vm.selected = {};
        vm.selectedItemCount = 0;

        // Create modal, edit modal namespaces
        vm.createImage = {};
        vm.editImage = {};

        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;

        vm.imageList = imageList;
        vm.showImageEditDialog = showImageEditDialog;
        vm.showImageCreateDialog = showImageCreateDialog;
        vm.deleteImage = deleteImage;

        vm.updateProject = updateProject;

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

        function showImageCreateDialog() {
            vm.createImage = {}
            $('#image-create-modal').modal('show');
        }

        function showImageEditDialog(image) {
            vm.selectedEditImage = image;

            vm.editImage = {
                id: image.id,
                name: image.name,
                skipImageBuild: image.skipImageBuild,
                tag: image.tag,
                description: image.description,
                skipTLS: image.skipTLS,
                url: image.url,
                username: image.username,
                password: image.password
            };
            $('#image-edit-modal').modal('show');
        }

        function deleteImage(image) {
            vm.project.images.splice(vm.project.images.indexOf(image), 1);
        }

        function createSaveImage(image) {
            vm.project.images.push(image);
        }

        function editSaveImage() {
            vm.selectedEditImage.id = vm.editImage.id;
            vm.selectedEditImage.name = vm.editImage.name;
            vm.selectedEditImage.skipImageBuild = vm.editImage.skipImageBuild;
            vm.selectedEditImage.tag = vm.editImage.tag;
            vm.selectedEditImage.description = vm.editImage.description;
            vm.selectedEditImage.skipTLS = vm.editImage.skipTLS;
            vm.selectedEditImage.url = vm.editImage.url;
            vm.selectedEditImage.username = vm.editImage.username;
            vm.selectedEditImage.password = vm.editImage.password;
            console.log(vm.selectedEditImage);
        }

        function updateProject(project) {
            console.log("update project" + project);
            ProjectService.update(project.id, project)
                .then(function(data) {
                    $state.transitionTo('dashboard.projects');
                }, function(data) {
                    vm.error = data;
                });
        }
    }
})();
