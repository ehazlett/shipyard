(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('EditController', EditController);

    EditController.$inject = ['resolvedProject', '$scope', 'ProjectService', 'RegistryService', '$state'];
    function EditController(resolvedProject, $scope, ProjectService, RegistryService, $state) {
        var vm = this;

        vm.project = resolvedProject;

        /*issues with ngmocksE2E. Commenting for now.*/
        vm.project.author = "admin";
        //vm.project.author = localStorage.getItem('X-Access-Token').split(":")[0];

        //TODO: Should the default state be on or off (i.e. checked or not checked)?
        vm.skipImages = false;
        vm.skipTests = false;

        vm.needsBuild = false;

        vm.selected = {};
        vm.selectedItemCount = 0;

        // Create modal, edit modal namespaces
        vm.createImage = {};
        vm.editImage = {};

        vm.createTest = {};
        vm.createTest.tagging = {};
        vm.createTest.provider = {};
        vm.editTest = {};
        vm.editTest.tagging = {};
        vm.editTest.provider = {};

        vm.createImage.additionalTags = [];

        var buildResults = {};

        vm.registries = [];
        vm.images = [];
        vm.shipyardImages = [];
        vm.publicRegistryTags = [];

        vm.providers = [];
        vm.providerTests = [];

        vm.parameters = [];

        vm.buttonStyle = "disabled";

        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;

        vm.createSaveTest = createSaveTest;

        vm.imageList = imageList;
        vm.showImageEditDialog = showImageEditDialog;
        vm.showImageCreateDialog = showImageCreateDialog;
        vm.showTestEditDialog = showTestEditDialog;
        vm.showDeleteImageDialog = showDeleteImageDialog;
        vm.deleteImage = deleteImage;

        vm.updateProject = updateProject;
        vm.resetValues = resetValues;
        vm.getRegistries = getRegistries;
        vm.checkImage = checkImage;
        vm.checkImagePublicRepository = checkImagePublicRepository;
        vm.getShipyardImages = getShipyardImages;
        vm.showTestCreateDialog = showTestCreateDialog;
        vm.getTestsProviders = getTestsProviders;
        vm.getJobs = getJobs;
        vm.checkProviderTest = checkProviderTest;
        vm.resetTestValues = resetTestValues;
        vm.showDeleteTestDialog = showDeleteTestDialog;
        vm.deleteTest = deleteTest;
        vm.editSaveTest = editSaveTest;
        vm.setTargets = setTargets;
        vm.addParameter = addParameter;
        vm.removeParameter = removeParameter;
        vm.addParameterEditTest = addParameterEditTest;
        vm.removeParameterEditTest = removeParameterEditTest;
        vm.getTests = getTests;
        vm.getImages = getImages;
        vm.buttonLoadStatus = buttonLoadStatus;
        vm.startBuild = startBuild;
        vm.getParameters = getParameters;
        vm.messageLoadStatus = messageLoadStatus;

        vm.getRegistries();
        vm.getImages(vm.project.id);
        vm.getTests(vm.project.id);

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
                    var isVisible = false;
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
                    vm.editImage.name = "";
                    vm.editImage.tag = "";
                    vm.editImage.description = "";
                    getShipyardImages(text);
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
                    $('#edit-project-test-create-modal').find("input").val("");
                    if(value === "Predefined Provider")
                        getTestsProviders();
                }
            });
        $(".ui.search.fluid.dropdown.parameter")
            .dropdown({
               onChange: function(value, text, $selectedItem) {
                   vm.ilmData = [];
                   angular.forEach(vm.allParameters, function (param) {
                       if(param.paramName === value) {
                           vm.ilmData = param.paramValue.map(function(x) { return {data: x};});
                       }
                   });
               }
            });

        var selectizeObj = null;

        vm.myConfig = {
            create: true,
            valueField: 'item',
            labelField: 'item',
            delimiter: '|',
            persist: false,
            placeholder: 'All images',
            onInitialize: function(selectize){
                selectizeObj = selectize;
            }
        };

        // Is this needed? if not, let's delete it.
        vm.myIlmData = {
            create: true,
            valueField: 'data',
            labelField: 'data',
            delimiter: '|',
            persist: false,
            placeholder: 'Select ILM Data',
            onInitialize: function(selectize){
                // receives the selectize object as an argument
            }
            // maxItems: 1
        };

        function showTestCreateDialog() {
            vm.createTest = {};
            vm.createTest.tagging = {};
            vm.createTest.provider = {};
            vm.imagesSelectize = [];
            angular.forEach(vm.images, function (image) {
                vm.imagesSelectize.push(image.name+":"+image.tag);
            });
            vm.items = vm.imagesSelectize.map(function(x) { return {item: x};});
            vm.getParameters();
            $('#edit-project-test-create-modal')
                .modal({
                    onHidden: function() {
                        vm.buttonStyle = "disabled";
                        $('#test-create-modal').find("input").val("");
                        $('.ui.dropdown').dropdown('restore defaults');
                        vm.createTest.provider.providerType = "";
                        if (selectizeObj) {
                            console.log("cleaned up selectize");
                            selectizeObj.clear();
                        }
                        vm.parameters = [];
                    },
                    closable: false
                })
                .modal('show');
        }

        function setTargets(data) {
            vm.createTest.targets=[];
            angular.forEach(data, function (target) {
                angular.forEach(vm.images, function (image) {
                    if(image.name === target) {
                        vm.createTest.targets.push({id: image.id,type: "image"});
                    }
                });
            });
        }

        function showTestEditDialog(test) {
            vm.editTest = $.extend(true, {}, test);
            vm.selectedEditTest = test;
            vm.buttonStyle = "positive";
            vm.getParameters();
            if(test.provider.providerType === "Predefined Provider") {
                vm.providers = [];
                ProjectService.getProviders()
                    .then(function(data) {
                        console.log(data);
                        vm.providers = data;
                        getJobs(test.provider.providerName);
                    }, function(data) {
                        vm.error = data;
                    })
            }
            if(test.provider.providerType === "Clair [Internal]") {
                vm.imagesSelectize = [];
                angular.forEach(vm.images, function (image) {
                    vm.imagesSelectize.push(image.name+":"+image.tag);
                });
                vm.items = vm.imagesSelectize.map(function(x) { return {item: x};});
            }
            console.log(test);
            $('#edit-project-test-edit-modal-'+vm.project.id)
                .modal({
                    closable: false
                })
                .modal('show');
        }

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

        function resetTestValues() {
            vm.createTest.provider.providerName = "";
            vm.createTest.provider.ProviderTest = "";
            vm.createTest.targets = "";
            vm.createTest.blocker = "";
            vm.createTest.name = "";
            vm.createTest.fromTag = "";
            vm.createTest.description = "";
            vm.createTest.tagging.onSuccess = "";
            vm.createTest.tagging.onFailure = "";
            vm.buttonStyle = "disabled";
            if(vm.createTest.provider.providerType === "Clair [Internal]") {
                vm.buttonStyle = "positive";
            }
            $('#test-create-modal').find("input").val("");
            $('.ui.search.fluid.dropdown.providerName').dropdown('restore defaults');
            $('.ui.search.fluid.dropdown.providerTest').dropdown('restore defaults');
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
            vm.editImage = $.extend(true, {}, image);
            vm.selectedEditImage = image;
            vm.buttonStyle = "positive";
            if(image.location === "Public Registry") {
                ProjectService.getPublicRegistryTags(image.name)
                    .then(function(data) {
                        var tagObject = $.grep(data, function (tag) {
                            return tag.name == image.tag;
                        })[0];

                        if (tagObject && tagObject.hasOwnProperty('layer')) {
                            vm.editImage.tagLayer = tagObject.layer;
                            vm.publicRegistryTags = data;
                        }
                    }, function(data) {
                        vm.error = data;
                    });
            }
            if(image.location === "Shipyard Registry") {
                getShipyardImages(image.registry);
            }
            $('#edit-project-image-edit-modal-'+vm.project.id)
                .modal({
                    closable: false
                })
                .modal('show');
        }

        function showDeleteImageDialog(image) {
            vm.selectedImage = image;
            $('#edit-project-delete-image-modal').modal('show');
        }

        function showDeleteTestDialog(test) {
            vm.selectedTest = test;
            $('#edit-project-delete-test-modal').modal('show');
        }

        function deleteImage(image) {
            console.log("delete image " + image.id + " from project " + vm.project.id);
            ProjectService.delete(vm.project.id,image.id)
                .then(function(data) {
                    vm.getImages(vm.project.id);
                }, function (data) {
                    vm.error = data;
                });
        }

        function deleteTest(test) {
            console.log("delete test " + test.id + " from project " + vm.project.id);
            ProjectService.deleteTest(vm.project.id,test.id)
                .then(function(data) {
                    vm.getTests(vm.project.id);
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

        function getTests(projectId) {
            console.log("project id");
            console.log(projectId);
            ProjectService.getTests(projectId)
                .then(function(data) {
                    console.log(data);
                    vm.tests = data;
                }, function(data) {
                    vm.error = data;
                })

        }

        function getImages(projectId) {
            console.log("get images");
            console.log(projectId);
            ProjectService.getImages(projectId)
                .then(function(data) {
                    console.log(data);
                    vm.images = data;
                }, function(data) {
                    vm.error = data;
                })

        }

        function getShipyardImages(registry) {
            vm.shipyardImages = [];
            RegistryService.listRepositories(registry)
                .then(function(data) {
                    console.log(data);
                    vm.shipyardImages = data;
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
                if(provider.providerName === testProvider) {
                    vm.providerTests = provider.providerJobs;
                }
            });
        }

        function checkImage(imageData) {
            vm.buttonStyle = "disabled";
            console.log(" check image " + imageData.name + " with tag " + imageData.tag);
            angular.forEach(vm.shipyardImages, function (image) {
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
                if(provider.providerName === providerName) {
                    angular.forEach(provider.providerJobs, function (test) {
                        if(test.name === providerTest) {
                            vm.buttonStyle = "positive";
                        }
                    });
                }
            });
        }

        function createSaveImage(image) {
            console.log("save image");
            console.log(image);
            ProjectService.addImage(vm.project.id, image)
                .then(function(data) {
                    vm.getImages(vm.project.id);
                }, function(data) {
                    vm.error = data;
                })
        }

        function createSaveTest(test) {
            ProjectService.addTest(vm.project.id, test)
                .then(function(data) {
                    vm.getTests(vm.project.id);
                }, function(data) {
                    vm.error = data;
                })
        }

        function editSaveImage() {
            ProjectService.updateImage(vm.project.id, $.extend(true, {}, vm.selectedEditImage))
                .then(function(data) {
                    vm.getImages(vm.project.id);
                }, function(data) {
                    vm.error = data;
                })
        }

        function editSaveTest() {
            ProjectService.updateTest(vm.project.id, $.extend(true, {}, vm.editTest))
                .then(function(data) {
                    vm.getTests(vm.project.id);
                }, function(data) {
                    vm.error = data;
                })
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

        function getParameters(){
            vm.allParameters = [];
            ProjectService.getParameters()
                .then(function(data) {
                    console.log(data);
                    vm.allParameters = data;
                }, function(data) {
                    vm.error = data;
                })
        }

        function addParameter() {
            if(!vm.createTest.parameters) {
                vm.createTest.parameters = [];
            }
            var param = {'paramName': vm.createTest.paramName, 'paramValue': vm.createTest.paramValue};
            vm.createTest.parameters.push(param);
            vm.createTest.paramName = "";
            vm.createTest.paramValue = "";
        }

        function removeParameter(index) {
            console.log(index);
            vm.createTest.parameters.splice(index, 1);
        }

        function addParameterEditTest() {
            var param = {'paramName': vm.editTest.paramName, 'paramValue': vm.editTest.paramValue};
            vm.editTest.parameters.push(param);
            vm.editTest.paramName = "";
            vm.editTest.paramValue = "";
        }

        function removeParameterEditTest(index) {
            vm.editTest.parameters.splice(index, 1);
        }

        function safeApply(scope, fn) {
            (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
        }

        vm.buildMessageConfig = {
            testId: ''
        };

        function startBuild(testId) {
            ProjectService.executeBuild(vm.project.id, testId, {action: 'start'})
                .then(function(data) {
                    console.log("starting build");
                    buildResults[testId] = data;
                    vm.buildMessageConfig.testId = testId;
                    pollBuild(vm.project.id, testId, buildResults[testId].id);
                }, function(data) {
                    vm.error = data;
                });
        }

        function pollBuild(projectId, testId, buildId) {
            ProjectService.pollBuild(projectId, testId, buildId)
                .then(function(status) {
                    console.log("polls done");
                    console.log(status);
                    buildResults[testId].status = status;
                }, function(data) {
                    vm.error = data;
                });
        }

        function showBuildResults(testId) {
            ProjectService.pollBuild(project.id, testId, buildResults[testId])
                .then(function(data) {
                    $state.transitionTo('dashboard.projects');
                }, function(data) {
                    vm.error = data;
                });
        }

        function buttonLoadStatus(testId) {
            if (!buildResults.hasOwnProperty(testId)) {
                return false;
            }

            if (buildResults[testId].status === 'running') {
                return true;
            }

            return false;
        }

        function messageLoadStatus(testId) {
            if (!buildResults.hasOwnProperty(testId) || !testId) {
                return 'none';
            }

            if (buildResults[testId].status === 'running') {
                return 'running';
            }

            if (buildResults[testId].status === 'stopped') {
                return 'stopped';
            }

            if (buildResults[testId].status === 'finished_success') {
                return 'finished_success';
            }

            if (buildResults[testId].status === 'finished_failed') {
                return 'finished_failed';
            }
        }

    }
})();
