
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
        vm.project.tests = [];

        // Create modal, edit modal namespaces
        vm.createImage = {};
        vm.editImage = {};
        vm.createTest = {};

        vm.skipImages = true;
        vm.skipTests= true;

        vm.registries = [];
        vm.images = [];
        vm.tests = [];

        vm.saveProject = saveProject;
        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;
        vm.createSaveTest = createSaveTest;
        vm.showImageCreateDialog = showImageCreateDialog;
        vm.showImageEditDialog = showImageEditDialog;
        vm.deleteImage = deleteImage;
        vm.getRegistries = getRegistries;
        vm.getImages = getImages;
        vm.getImagesDockerhub = getImagesDockerhub;
        vm.showTestCreateDialog = showTestCreateDialog;
        vm.checkImage = checkImage;

        vm.getRegistries();

        vm.buttonStyle = "disabled";

        $(".ui.search.fluid.dropdown.registry")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    console.log('getting images for ' + text);
                    getImages(text);
                    checkImage();
                }
            });
        $(".ui.search.fluid.dropdown.publicregistryimage")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    console.log('searching dockerhub ');
                    getImagesDockerhub(text);
                }
            });

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
            $('#image-create-modal')
                .modal({
                    onHidden: function() {
                        $('#image-create-modal').find("input").val("");
                        console.log('remove Data');
                        //$('#image-create-modal').empty();
                        $('#imageLocation').removeData();
                    }
                })
                .modal('show');
        }

        function showTestCreateDialog() {
            vm.createImage = {};
            $('#test-create-modal')
                .modal({
                    onHidden: function() {
                        $('#test-create-modal').find("input").val("");
                    }
                })
                .modal('show');
        }

        function showImageEditDialog(image) {
            vm.selectedEditImage = image;

            vm.editImage = {
                name: image.name,
                registry: image.registry,
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
            vm.selectedEditImage.registry = vm.selectedEditImage.registry;
            vm.selectedEditImage.skipImageBuild = vm.editImage.skipImageBuild;
            vm.selectedEditImage.tag = vm.editImage.tag;
            vm.selectedEditImage.description = vm.editImage.description;
            vm.selectedEditImage.location = vm.editImage.location;
            console.log(vm.selectedEditImage);
        }

        function deleteImage(image) {
            vm.project.images.splice(vm.project.images.indexOf(image), 1);
        }

        function createSaveTest(test) {
            vm.project.tests.push(test);
        }

        function getRegistries() {
            console.log("get regs");
            vm.registries = [];
            RegistryService.list()
                .then(function(data) {
                    console.log(data);
                    vm.registries = data;
                }, function(data) {
                    vm.error = data;
                })

        }

        function getImages(registry) {
            console.log("get images");
            vm.images = [];
            RegistryService.listRepositories(registry)
                .then(function(data) {
                    console.log(data);
                    vm.images = data;
                }, function(data) {
                    vm.error = data;
                })
        }

        function checkImage() {
            vm.buttonStyle = "disabled";
            angular.forEach(vm.images, function (image) {
                if(image.name === vm.createImage.name && image.tag === vm.createImage.tag) {
                    vm.buttonStyle = "positive";
                }
            });
        }

        function getImagesDockerhub(name) {
            RegistryService.listDockerhubRepos(name)
                .then(function(data) {
                    console.log("dockerhub images: " + data);
                    vm.imagesPublic = data;
                }, function(data) {
                    vm.error = data;
                })
        }
    }
})();
