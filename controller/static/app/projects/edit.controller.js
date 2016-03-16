(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('EditController', EditController);

    EditController.$inject = ['resolvedProject', '$scope', 'ProjectService', 'RegistryService', '$state'];
    function EditController(resolvedProject, $scope, ProjectService, RegistryService, $state) {
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

        vm.createImage.additionalTags = [];

        vm.registries = [];
        vm.images = [];
        vm.publicRegistryTags = [];

        vm.buttonStyle = "disabled";

        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;

        vm.imageList = imageList;
        vm.showImageEditDialog = showImageEditDialog;
        vm.showImageCreateDialog = showImageCreateDialog;
        vm.showDeleteImageDialog = showDeleteImageDialog;
        vm.deleteImage = deleteImage;

        vm.updateProject = updateProject;
        vm.resetValues = resetValues;
        vm.getRegistries = getRegistries;
        vm.checkImage = checkImage;
        vm.checkImagePublicRepository = checkImagePublicRepository;
        vm.getImages = getImages;

        vm.getRegistries();

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

        $(".ui.search.fluid.dropdown.registry")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    $('#edit-project-image-create-modal').find("input").val("");
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
                    var tagObject = $.grep(vm.publicRegistryTags, function (tag) {
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
                vm.createImage.name = result.title;
                vm.createImage.description = result.description;
                vm.createImage.tag = "";
                vm.buttonStyle = "disabled";
                $('.ui.search.fluid.dropdown.tag').dropdown('restore defaults');
                ProjectService.getPublicRegistryTags(result.name)
                    .then(function(data) {
                        vm.publicRegistryTags = data;
                    }, function(data) {
                        vm.error = data;
                    });
            },
            minCharacters: 3
        });

        function resetValues() {
            vm.createImage.name = "";
            vm.createImage.tag = "";
            vm.createImage.description = "";
            vm.buttonStyle = "disabled";
            $('#edit-project-image-create-modal').find("input").val("");
            $('.ui.search.fluid.dropdown.registry').dropdown('restore defaults');
            $('.ui.search.fluid.dropdown.image').dropdown('restore defaults');
            $('.ui.search.fluid.dropdown.tag').dropdown('restore defaults');
        }

        function showImageCreateDialog() {
            vm.createImage = {};
            $('#edit-project-image-create-modal')
                .modal({
                    onHidden: function() {
                        $('#edit-project-image-create-modal').find("input").val("");
                        $('.ui.dropdown').dropdown('restore defaults');
                        vm.createImage.location = "";
                    },
                    closable: false
                })
                .modal('show');
        }

        function showImageEditDialog(image) {
            vm.selectedEditImage = image;

            vm.editImage = {
                id: image.id,
                name: image.name,
                skipImageBuild: image.skipImageBuild,
                tag: image.tag,
                description: image.description,
                location: image.location
            };
            $('#edit-project-image-edit-modal').modal('show');
        }

        function showDeleteImageDialog(image) {
            vm.selectedImage = image;
            $('#edit-project-delete-image-modal').modal('show');
        }

        function deleteImage(image) {
            console.log("delete image " + image.id + " from project " + vm.project.id);
            ProjectService.delete(vm.project.id,image.id)
                .then(function(data) {
                    vm.project.images.splice(vm.project.images.indexOf(image), 1);
                }, function (data) {
                    vm.error = data;
                });
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
            angular.forEach(vm.publicRegistryTags, function (tag) {
                if(tag.name === vm.createImage.tag) {
                    vm.buttonStyle = "positive";
                }
            });
        }

        function createSaveImage(image) {
            if (vm.project.images == null) {
                vm.project.images = [];
            }
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
