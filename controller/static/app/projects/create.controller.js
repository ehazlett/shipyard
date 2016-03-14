(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('CreateController', CreateController);

    CreateController.$inject = ['$scope', 'ProjectService', 'RegistryService', '$state', '$http'];
    function CreateController($scope, ProjectService, RegistryService, $state, $http) {
        var vm = this;

        vm.project = {};
        vm.project.images = [];
        vm.project.author = localStorage.getItem('X-Access-Token').split(":")[0];
        vm.project.tests = [];

        // Create modal, edit modal namespaces
        vm.createImage = {};
        vm.editImage = {};
        vm.createTest = {};

        vm.createImage.additionalTags = [];

        vm.skipImages = true;
        vm.skipTests= true;

        vm.registries = [];
        vm.images = [];
        vm.tags = [];
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
        vm.showTestCreateDialog = showTestCreateDialog;
        vm.checkImage = checkImage;
        vm.getTags = getTags;
        vm.resetValues = resetValues;
        vm.checkImagePublicRepository = checkImagePublicRepository;

        vm.getRegistries();

        vm.buttonStyle = "disabled";

        $(".ui.search.fluid.dropdown.registry")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    $('#image-create-modal').find("input").val("");
                    $('.ui.search.fluid.dropdown.image').dropdown('restore defaults');
                    $('.ui.search.fluid.dropdown.tag').dropdown('restore defaults');
                    vm.createImage.name = "";
                    vm.createImage.tag = "";
                    vm.createImage.description = "";
                    vm.buttonStyle = "disabled";
                    getImages(text);
                }
            });
        $(".ui.search.fluid.dropdown.tag")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    // Search for the image layer of the chosen tag
                    // TODO: find a way to save the layer when the user clicks on the tag name
                    console.log(value);
                    var tagObject = $.grep(vm.tags, function (tag) {
                        return tag.name == value;
                    })[0];

                    if (tagObject)
                        vm.createImage.tagLayer = tagObject.hasOwnProperty('layer')? tagObject.layer : '';

                    $scope.$apply();
                }
            });
        $('.ui.search').search({
            apiSettings: {
                url: 'https://index.docker.io/v1/search?q={query}',
                // Little hack to get title to show up (some of the docs don't apply to our version of semantic)
                successTest: function(response) {
                    $.each(response.results, function(index,item) {
                        response.results[index].title = response.results[index].name;
                    });
                    return true;
                }
            },
            onSelect: function(result,response) {
                vm.createImage.description = result.description;
                vm.getTags(result.name);
                console.log(vm.tags);
            },
            minCharacters: 3
        });

        function resetValues() {
            vm.createImage.name = "";
            vm.createImage.tag = "";
            vm.createImage.description = "";
            vm.buttonStyle = "disabled";
            $('#image-create-modal').find("input").val("");
            $('.ui.search.fluid.dropdown.registry').dropdown('restore defaults');
            $('.ui.search.fluid.dropdown.image').dropdown('restore defaults');
            $('.ui.search.fluid.dropdown.tag').dropdown('restore defaults');
        }

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
                        $('.ui.dropdown').dropdown('restore defaults');
                        vm.createImage.location = "";
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
            vm.buttonStyle = "disabled";
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

        function getTags(imageName) {
            console.log("get tags");
            vm.tags = [];
            $http.get('https://registry.hub.docker.com/v1/repositories/'+imageName+'/tags')
                .then(function(response) {
                    vm.tags = response.data;
                }, function(data) {
                    vm.error = data;
                })
        }

        function checkImage() {
            vm.buttonStyle = "disabled";
            console.log(" check image " + vm.createImage.name + " with tag " + vm.createImage.tag);
            angular.forEach(vm.images, function (image) {
                if(image.name === vm.createImage.name && image.tag === vm.createImage.tag) {
                    vm.buttonStyle = "positive";
                }
            });
        }

        function checkImagePublicRepository() {
            vm.buttonStyle = "disabled";
            console.log(" check image " + vm.createImage.name + " with tag " + vm.createImage.tag);
            angular.forEach(vm.tags, function (tag) {
                if(tag.name === vm.createImage.tag) {
                    vm.buttonStyle = "positive";
                }
            });
        }
    }
})();
