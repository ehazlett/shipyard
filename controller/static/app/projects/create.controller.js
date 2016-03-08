
(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('CreateController', CreateController);

    CreateController.$inject = ['$scope', 'ProjectService', 'RegistryService', '$state'];
    function CreateController($scope, ProjectService, RegistryService, $state) {
        var vm = this;

        vm.project = {};
        vm.project.images = [];
        vm.project.author = localStorage.getItem('X-Access-Token').split(":")[0];

        // Create modal, edit modal namespaces
        vm.createImage = {};
        vm.editImage = {};

        vm.skipImages = true;
        vm.skipTests= true;

        vm.registries = [];
        vm.Images = [];

        vm.saveProject = saveProject;
        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;
        vm.showImageCreateDialog = showImageCreateDialog;
        vm.showImageEditDialog = showImageEditDialog;
        vm.deleteImage = deleteImage;
        vm.getImages = getImages;

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
                name: image.name,
                skipImageBuild: image.skipImageBuild,
                tag: image.tag,
                description: image.description,
                location: image.location
            };
            $('#image-edit-modal').modal('show');
        }

        function createSaveImage(image) {
            vm.project.images.push(image);
        }

        function editSaveImage() {
            vm.selectedEditImage.name = vm.editImage.name;
            vm.selectedEditImage.skipImageBuild = vm.editImage.skipImageBuild;
            vm.selectedEditImage.tag = vm.editImage.tag;
            vm.selectedEditImage.description = vm.editImage.description;
            vm.selectedEditImage.location = vm.editImage.location;
            console.log(vm.selectedEditImage);
        }

        function deleteImage(image) {
            vm.project.images.splice(vm.project.images.indexOf(image), 1);
        }

        function getImages() {
            console.log("get images");
            /*ProjectService.getImages()
                .then(function(data) {
                    vm.Images = [];
                    vm.Images = data;
                }, function(data) {
                    vm.error = data;
                });*/
            RegistryService.list()
                .then(function(data) {
                    vm.registries = data;
                }, function(data) {
                    vm.error = data;
                });
            vm.error = "";
        }
    }
})();
