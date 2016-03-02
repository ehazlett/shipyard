
(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('CreateController', CreateController);

    CreateController.$inject = ['$scope', 'ProjectService', '$state'];
    function CreateController($scope, ProjectService, $state) {
        var vm = this;

        vm.project = {};
        vm.project.images = [];
        vm.project.author = localStorage.getItem('X-Access-Token').split(":")[0];

        // Create modal, edit modal namespaces
        vm.createImage = {};
        vm.editImage = {};

        vm.skipImages = true;
        vm.skipTests= true;

        vm.saveProject = saveProject;
        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;
        vm.showImageCreateDialog = showImageCreateDialog;
        vm.showImageEditDialog = showImageEditDialog;
        vm.deleteImage = deleteImage;

        function saveProject(project){
            console.log("saving project" + project);
            ProjectService.create(project)
                .then(function(data) {
                    $state.transitionTo('dashboard.projects');
                }, function(data) {
                    vm.error = data;
                });
        }

        function showImageCreateDialog() {
            vm.createImage = {};
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

        function deleteImage(image) {
            vm.project.images.splice(vm.project.images.indexOf(image), 1);
        }
    }
})();
