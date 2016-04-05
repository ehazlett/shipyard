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
        vm.createTest.tagging = [];
        vm.createTest.targets = [];
        vm.createTest.provider = {};
        vm.editTest = {};
        vm.editTest.tagging = {};
        vm.editTest.provider = {};

        vm.createImage.additionalTags = [];

        vm.skipImages = true;
        vm.skipTests= true;

        vm.registries = [];
        vm.images = [];
        vm.publicRegistryTags = [];
        vm.tests = [];
        vm.imagesSelectize= [];
        vm.providers = [];
        vm.providerTests = [];

        vm.saveProject = saveProject;
        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;
        vm.editSaveTest    = editSaveTest;
        vm.createSaveTest = createSaveTest;
        vm.showImageCreateDialog = showImageCreateDialog;
        vm.showImageEditDialog = showImageEditDialog;
        vm.deleteImage = deleteImage;
        vm.deleteTest = deleteTest;
        vm.getRegistries = getRegistries;
        vm.getImages = getImages;
        vm.showTestCreateDialog = showTestCreateDialog;
        vm.showTestEditDialog = showTestEditDialog;
        vm.checkImage = checkImage;
        vm.resetValues = resetValues;
        vm.resetTestValues = resetTestValues;
        vm.checkImagePublicRepository = checkImagePublicRepository;
        vm.getTestsProviders = getTestsProviders;
        vm.getJobs = getJobs;
        vm.checkProviderTest = checkProviderTest;
        vm.setTargets = setTargets;

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
                    vm.editImage.name = "";
                    vm.editImage.tag = "";
                    vm.editImage.description = "";
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
        $(".ui.search.fluid.dropdown.edit.tag")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    // Search for the image layer of the chosen tag
                    // TODO: find a way to save the layer when the user clicks on the tag name
                    var tagObject = $.grep(vm.publicRegistryTags, function (tag) {
                        return tag.name == value;
                    })[0];

                    if (tagObject)
                        vm.editImage.tagLayer = tagObject.hasOwnProperty('layer')? tagObject.layer : '';

                    $scope.$apply();
                }
            });
        $('.ui.search').search({
            apiSettings: {
                url: '/api/v1/search?q={query}',
                beforeXHR: function(xhr) {
                    xhr.setRequestHeader('X-Access-Token', localStorage.getItem('X-Access-Token'))
                },
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
                vm.editImage.tag = "";
                vm.buttonStyle = "disabled";
                vm.publicRegistryTags = "";
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
        $('.ui.search.edit').search({
            apiSettings: {
                url: '/api/v1/search?q={query}',
                beforeXHR: function(xhr) {
                    xhr.setRequestHeader('X-Access-Token', localStorage.getItem('X-Access-Token'))
                },
                // Little hack to get title to show up (some of the docs don't apply to our version of semantic)
                successTest: function(response) {
                    $.each(response.results, function(index,item) {
                        response.results[index].title = response.results[index].name;
                    });
                    return true;
                }
            },
            onSelect: function(result,response) {
                vm.editImage.name = result.title;
                vm.editImage.description = result.description;
                vm.editImage.tag = "";
                vm.buttonStyle = "disabled";
                vm.publicRegistryTags = "";
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

        $(".ui.search.fluid.dropdown.testProvider")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    $('#test-create-modal').find("input").val("");
                    if(value === "Predefined Provider")
                    getTestsProviders();
                }
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

        function resetTestValues() {
            vm.createTest.provider.name = "";
            vm.createTest.provider.test = "";
            vm.createTest.targets = "";
            vm.createTest.blocker = "";
            vm.createTest.name = "";
            vm.createTest.fromTag = "";
            vm.createTest.description = "";
            vm.createTest.tagging.onSuccess = "";
            vm.createTest.tagging.onFailure = "";
            vm.buttonStyle = "disabled";
            if(vm.createTest.provider.type === "Clair [Internal]") {
                vm.buttonStyle = "positive";
            }
            $('#test-create-modal').find("input").val("");
            $('.ui.search.fluid.dropdown.providerName').dropdown('restore defaults');
            $('.ui.search.fluid.dropdown.providerTest').dropdown('restore defaults');
        }

        function saveProject(project){
            console.log("saving project");
            console.log(project);
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
                    },
                    closable: false
                })
                .modal('show');
        }

        vm.myConfig = {
            create: true,
            valueField: 'item',
            labelField: 'item',
            delimiter: '|',
            placeholder: 'All images',
            onInitialize: function(selectize){
                // receives the selectize object as an argument
            },
            // maxItems: 1
        };

        function showTestCreateDialog() {
            vm.createTest = {};
            vm.createTest.tagging = {};
            vm.createTest.provider = {};
            vm.imagesSelectize = [];
            angular.forEach(vm.project.images, function (image) {
                vm.imagesSelectize.push(image.name);
            });
            vm.items = vm.imagesSelectize.map(function(x) { return {item: x};});
            $('#test-create-modal')
                .modal({
                    onHidden: function() {
                        vm.buttonStyle = "disabled";
                        $('#test-create-modal').find("input").val("");
                        $('.ui.dropdown').dropdown('restore defaults');
                        vm.createTest.provider.type ="";
                    }
                })
                .modal('show');
        }

        function setTargets(data) {
            vm.createTest.targets=[];
            angular.forEach(data, function (target) {
                vm.createTest.targets.push({id: "",type: target});
            });
        }

        function showTestEditDialog(test) {
            vm.editTest = $.extend(true, {}, test);
            vm.selectedEditTest = test;
            vm.buttonStyle = "positive";
            console.log(test);
            $('#test-edit-modal')
                .modal({
                    closable: false
                })
                .modal('show');
        }

        function showImageEditDialog(image) {
            vm.editImage = $.extend(true, {}, image);
            vm.selectedEditImage = image;
            vm.buttonStyle = "positive";
            ProjectService.getPublicRegistryTags(image.name)
                .then(function(data) {
                    vm.publicRegistryTags = data;
                }, function(data) {
                    vm.error = data;
                });
            $('#image-edit-modal')
                .modal({
                    closable: false
                })
                .modal('show');
        }

        function createSaveImage(image) {
            vm.buttonStyle = "disabled";
            vm.project.images.push($.extend(true,{},image));
            console.log(vm.project.images);
        }

        function createSaveTest(test) {
            vm.project.tests.push($.extend(true,{},test));
        }

        function editSaveImage() {
            vm.selectedEditImage.location = vm.editImage.location;
            vm.selectedEditImage.name = vm.editImage.name;
            vm.selectedEditImage.registry = vm.editImage.registry;
            vm.selectedEditImage.tag = vm.editImage.tag;
            vm.selectedEditImage.description = vm.editImage.description;
            console.log(vm.selectedEditImage);
        }

        function editSaveTest() {
            vm.selectedEditTest.provider.type = vm.editTest.provider.type ;
            vm.selectedEditTest.provider.name = vm.editTest.provider.name;
            vm.selectedEditTest.provider.test = vm.editTest.provider.test;
            vm.selectedEditTest.name = vm.editTest.name;
            vm.selectedEditTest.fromTag = vm.editTest.fromTag;
            vm.selectedEditTest.description = vm.editTest.description;
            vm.selectedEditTest.tagging.onFailure = vm.editTest.tagging.onFailure;
            vm.selectedEditTest.tagging.onSuccess = vm.editTest.tagging.onSuccess;
            vm.selectedEditTest.blocker = vm.editTest.blocker;
            vm.selectedEditTest.targets = vm.editTest.targets;
        }

        function deleteImage(image) {
            vm.project.images.splice(vm.project.images.indexOf(image), 1);
        }

        function deleteTest(test) {
            vm.project.tests.splice(vm.project.tests.indexOf(test), 1);
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

        function getTestsProviders() {
            console.log("get providers");
            vm.providers = [];
            ProjectService.getProviders()
                .then(function(data) {
                    console.log(data);
                    vm.providers = data;
                }, function(data) {
                    vm.error = data;
                })
        }

        function getJobs(testProvider) {
            vm.providerTests = [];
            $('.ui.search.fluid.dropdown.providerTest').dropdown('restore defaults');
            angular.forEach(vm.providers, function(provider) {
                if(provider.name === testProvider) {
                    vm.providerTests = provider.providerJobs;
                }
            });
        }

        function checkImage(imageData) {
            vm.buttonStyle = "disabled";
            console.log(" check image " + imageData.name + " with tag " + imageData.tag);
            angular.forEach(vm.images, function (image) {
                if(image.name === imageData.name && image.tag === imageData.tag) {
                    vm.buttonStyle = "positive";
                }
            });
        }

        function checkImagePublicRepository(imageData) {
            vm.buttonStyle = "disabled";
            console.log(" check image " + imageData.name + " with tag " + imageData.tag);
            angular.forEach(vm.publicRegistryTags, function (tag) {
                if(tag.name === imageData.tag) {
                    vm.buttonStyle = "positive";
                }
            });
        }

        function checkProviderTest(providerName,providerTest) {
            vm.buttonStyle = "disabled";
            console.log(" check provider name " + providerName + " with tag " + providerTest);
            angular.forEach(vm.providers, function (provider) {
                if(provider.name === providerName) {
                    angular.forEach(provider.providerJobs, function (test) {
                        if(test.name === providerTest) {
                            vm.buttonStyle = "positive";
                        }
                    });
                }
            });
        }
    }
})();
