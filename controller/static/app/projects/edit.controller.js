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
        vm.projectIsUpdated = false;
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

        var builds = {};

        vm.registries = [];
        vm.images = [];
        vm.shipyardImages = [];
        vm.publicRegistryTags = [];

        vm.providers = [];
        vm.providerTests = [];

        vm.parameters = [];

        vm.buildMessageConfig = {
            testId: ''
        };

        vm.saveProjectMessageConfig = {
            status: 'hidden' // 'hidden' 'success' 'failure'
        };

        vm.buttonStyle = "disabled";

        vm.createImageTagSpin = false;
        vm.editImageTagSpin = false;

        vm.createSaveImage = createSaveImage;
        vm.editSaveImage   = editSaveImage;

        vm.createSaveTest = createSaveTest;

        vm.list = list;
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
        vm.setTargetsCreateTest = setTargetsCreateTest;
        vm.setTargetsEditTest = setTargetsEditTest;
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
        vm.cancelCreateSaveImage = cancelCreateSaveImage;
        vm.cancelEditSaveImage = cancelEditSaveImage;
        vm.enableSaveProject = enableSaveProject;

        vm.getRegistries();
        vm.getImages(vm.project.id);
        vm.getTests(vm.project.id);

        vm.randomCreateId = null;
        vm.randomEditId = null;
        vm.randomCreateTestId = null;
        vm.randomEditTestId = null;

        function makeId() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 16; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

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
        $scope.$watchCollection('list()', function () {
            angular.forEach(vm.selected, function (s) {
                if(vm.selected[s.Id].Selected == true) {
                    var isVisible = false;
                    angular.forEach($scope.list(), function(c) {
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

        $scope.$watch('b', function() {
            // do something here
            $scope.count += 1;
        }, true);

        function list() {
            return Object.keys(vm.project)
        }

        $(".ui.search.fluid.dropdown.registry")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    console.log("heres registyr: " + vm.createImage.registry);
                    $('#edit-project-image-create-modal-'+vm.project.id).find("input").val("");
                    $('.ui.search.fluid.dropdown.image').dropdown('restore defaults');
                    $('.ui.search.fluid.dropdown.tag').dropdown('restore defaults');
                    vm.createImage.name = "";
                    vm.createImage.tag = "";
                    vm.createImage.description = "";
                    vm.buttonStyle = "disabled";
                    vm.editImage.name = "";
                    vm.editImage.tag = "";
                    vm.editImage.description = "";
                    getShipyardImages(value);
                }
            });
        $(".ui.selection.fluid.dropdown.tag.create")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    vm.createImage.tag = value.toString();
                    checkImagePublicRepository(vm.createImage);

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
        $(".ui.selection.fluid.dropdown.edit.tag")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    vm.editImage.tag = value.toString();
                    checkImagePublicRepository(vm.editImage);
                    
                    // Search for the image layer of the chosen tag
                    // TODO: find a way to save the layer when the user clicks on the tag name
                    var tagObject = $.grep(vm.publicRegistryTags, function (tag) {
                        return tag.name == value;
                    })[0];

                    if (tagObject)
                        vm.editImage.tagLayer = tagObject.hasOwnProperty('layer')? tagObject.layer : '';

                    vm.editImage.additionalTags = [];
                    $.each(vm.publicRegistryTags, function(index,item) {
                        if(vm.publicRegistryTags[index].layer === vm.editImage.tagLayer) {
                            vm.editImage.additionalTags.push(vm.publicRegistryTags[index].name);
                        }
                    });

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
                vm.createImageTagSpin = true;
                vm.createImage.name = result.title;
                vm.createImage.description = result.description;
                vm.createImage.tag = "";
                vm.buttonStyle = "disabled";
                $('.ui.selection.fluid.dropdown.tag.create').dropdown('restore defaults');
                ProjectService.getPublicRegistryTags(result.name)
                    .then(function(data) {
                        vm.publicRegistryTags = data;
                        vm.createImageTagSpin = false;
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
                vm.editImageTagSpin = true;
                vm.editImage.name = result.title;
                vm.editImage.description = result.description;
                vm.editImage.tag = "";
                vm.buttonStyle = "disabled";
                vm.publicRegistryTags = "";
                $('.ui.selection.fluid.dropdown.edit.tag').dropdown('restore defaults');
                ProjectService.getPublicRegistryTags(result.name)
                    .then(function(data) {
                        vm.publicRegistryTags = data;
                        vm.editImageTagSpin = false;
                    }, function(data) {
                        vm.error = data;
                    });
            },
            minCharacters: 3
        });

        $(".ui.search.fluid.dropdown.testProvider")
            .dropdown({
                onChange: function(value, text, $selectedItem) {
                    $('#edit-project-test-create-modal-'+vm.randomCreateTestId).find("input").val("");
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

        
        var createSelectizeObj = null;
        vm.createTest.selectizeConfig = {
            create: true,
            valueField: 'item',
            labelField: 'item',
            delimiter: '|',
            placeholder: 'All images',
            onInitialize: function(selectize){
                createSelectizeObj = selectize;
            }
        };

        function showTestCreateDialog() {
            vm.createTest = {};
            vm.createTest.tagging = {};
            vm.createTest.provider = {};
            var imagesSelectize = [];
            vm.randomCreateTestId = makeId();
            $scope.$apply();
            angular.forEach(vm.images, function (image) {
                imagesSelectize.push(image.name+":"+image.tag);
            });
            vm.createTest.selectizeItems = imagesSelectize.map(function(x) { return {item: x};});
            vm.getParameters();
            $('#edit-project-test-create-modal-'+vm.randomCreateTestId)
                .modal({
                    onHidden: function() {
                        vm.buttonStyle = "disabled";
                        $('#test-create-modal').find("input").val("");
                        $('.ui.dropdown').dropdown('restore defaults');
                        vm.createTest.provider.providerType = "";
                        if (createSelectizeObj) {
                            console.log("cleaned up selectize");
                            createSelectizeObj.clear();
                            vm.items = [];
                        }
                        vm.parameters = [];
                    },
                    closable: false
                })
                .modal('show');
        }

        // TODO: Handle setting target for editTestModal
        function setTargetsCreateTest(data) {
            // If data is empty, skip setTargets
            // This is to selectize's cleanup from modifying vm.creatTest.targets
            if (data.length == 0) {
                return;
            }
            vm.createTest.targets=[];
            angular.forEach(data, function (target) {
                angular.forEach(vm.images, function (image) {
                    if(image.name + ':' + image.tag === target) {
                        vm.createTest.targets.push({id: image.id,type: "image"});
                    }
                    // TODO: Shouldn't the "else" case issue an error/warning?
                });
            });
        }

        function setTargetsEditTest(data) {
            if (data.length == 0) {
                return;
            }
            vm.editTest.targets=[];
            angular.forEach(data, function (target) {
                angular.forEach(vm.images, function (image) {
                    if(image.name + ':' + image.tag === target) {
                        vm.editTest.targets.push({id: image.id,type: "image"});
                    }
                    // TODO: Shouldn't the "else" case issue an error/warning?
                });
            });
        }

        vm.editTest.selectizeConfig = {
            create: true,
            valueField: 'item',
            labelField: 'item',
            delimiter: '|',
            placeholder: 'Select ILM Data',
            onInitialize: function(selectize){
                // receives the selectize object as an argument
            }
            // maxItems: 1
        };

        function showTestEditDialog(test) {
            vm.editTest = $.extend(true, {}, test);
            vm.editTest.selectizeData = [];
            vm.selectedEditTest = test;
            vm.buttonStyle = "positive";
            vm.randomEditTestId = vm.editTest.id;
            $scope.$apply();
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
                var targetIds = vm.editTest.targets.map(function(x) { return x.id;});

                var imagesSelectize = [];
                angular.forEach(vm.images, function (image) {
                    imagesSelectize.push(image.name+":"+image.tag);
                });
                angular.forEach(vm.images, function (image) {
                    if ($.inArray(image.id, targetIds) != -1) {
                        vm.editTest.selectizeData.push(image.name+":"+image.tag);
                    }
                });
                vm.editTest.selectizeItems = imagesSelectize.map(function(x) { return {item: x};});
            }
            $('#edit-project-test-edit-modal-'+vm.randomEditTestId)
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
            $('#edit-project-image-create-modal-'+vm.randomCreateId).find("input").val("");
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
            vm.randomCreateId = makeId();
            // safeApply($scope, function(){
            //     vm.randomCreateId = makeId();
            // });
            $scope.$apply();
            $('#edit-project-image-create-modal-'+vm.randomCreateId)
                .modal({
                    onHidden: function() {
                        $('#edit-project-image-create-modal-'+vm.randomCreateId).find("input").val("");
                        // $('#edit-project-image-create-modal-'+vm.project.id).modal('destroy');
                        $('.ui.dropdown').dropdown('restore defaults');
                        vm.createImage.location = "";
                        vm.publicRegistryTags = [];
                    },
                    closable: false
                })
                .modal('show');
        }

        function showImageEditDialog(image) {
            vm.editImage = $.extend(true, {}, image);
            vm.selectedEditImage = image;
            vm.buttonStyle = "positive";
            vm.randomEditId = vm.editImage.id;
            vm.editImageTagSpin = true;
            $('#editImageTagDefault').html(image.tag);
            $scope.$apply();
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
                        vm.editImage.additionalTags = [];
                        $.each(vm.publicRegistryTags, function(index,item) {
                            if(vm.publicRegistryTags[index].layer === vm.editImage.tagLayer) {
                                vm.editImage.additionalTags.push(vm.publicRegistryTags[index].name);
                            }
                        });
                        vm.editImageTagSpin = false;
                    }, function(data) {
                        vm.error = data;
                    });
            }
            if(image.location === "Shipyard Registry") {
                getShipyardImages(image.registry);
                vm.editImageTagSpin = false;
            }
            $('#edit-project-image-edit-modal-'+vm.randomEditId)
                .modal({
                    onHidden: function() {
                        // $('#edit-project-image-edit-modal-'+vm.project.id).modal('destroy');
                        $('.ui.dropdown').dropdown('restore defaults');
                        vm.publicRegistryTags = [];
                    },
                    onShow: function () {
                        $("#editImageTag").dropdown("refresh");
                        $("#editImageTag").dropdown("set selected", image.tag);
                    },
                    onVisible: function () {
                        $("#editImageTag").dropdown("refresh");
                        $("#editImageTag").dropdown("set selected", image.tag);
                    },
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
                if(tag.name == imageData.tag) { // Type converting equality since tags may be integers (1) or strings (latest)
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
            console.log("data rdy for saving");
            console.log(test);
            ProjectService.addTest(vm.project.id, test)
                .then(function(data) {
                    vm.getTests(vm.project.id);
                }, function(data) {
                    vm.error = data;
                })
        }

        function editSaveImage() {
            ProjectService.updateImage(vm.project.id, $.extend(true, {}, vm.editImage))
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
            vm.projectIsUpdated = false;
            ProjectService.update(project.id, project)
                .then(function(data) {
                    vm.saveProjectMessageConfig.status = 'success';
                    setTimeout(function () {
                        vm.saveProjectMessageConfig.status = 'hidden';
                        $scope.$apply();
                    }, 3000);
                }, function(data) {
                    vm.projectIsUpdated = true;
                    vm.saveProjectMessageConfig.status = 'failure';
                    setTimeout(function () {
                        vm.saveProjectMessageConfig.status = 'hidden';
                        $scope.$apply();
                    }, 3000);
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

        function startBuild(testId) {
            ProjectService.executeBuild(vm.project.id, testId, {action: 'start'})
                .then(function(data) {
                    console.log("starting build");
                    builds[testId] = {id: data.id};
                    builds[testId].status = "running";
                    vm.buildMessageConfig.testId = testId;
                    pollBuild(vm.project.id, testId, builds[testId].id);
                }, function(data) {
                    vm.error = data;
                });
        }

        function pollBuild(projectId, testId, buildId) {
            ProjectService.pollBuild(projectId, testId, buildId)
                .then(function(status) {
                    console.log("polls done" + " .." + status);
                    console.log(status);
                    builds[testId].status = status;
                }, function(data) {
                    vm.error = data;
                });
        }

        function buttonLoadStatus(testId) {
            if (!builds.hasOwnProperty(testId)) {
                return false;
            }

            if (builds[testId].status === 'running') {
                return true;
            }

            return false;
        }

        function messageLoadStatus(testId) {
            if (!builds.hasOwnProperty(testId) || !testId) {
                return 'none';
            }

            if (builds[testId].status === 'running') {
                return 'running';
            }

            if (builds[testId].status === 'stopped') {
                return 'stopped';
            }

            if (builds[testId].status === 'finished_success') {
                return 'finished_success';
            }

            if (builds[testId].status === 'finished_failed') {
                return 'finished_failed';
            }
        }

        function cancelCreateSaveImage() {
            if (!ProjectService.cancelGetPublicRegistryTags()) {
                console.log("Could not cancel cancelCreateSaveImage");
            }
        }

        function cancelEditSaveImage() {
            if (!ProjectService.cancelGetPublicRegistryTags()) {
                console.log("Could not cancel cancelEditSaveImage");
            }
        }

        function enableSaveProject() {
            vm.projectIsUpdated = true;
        }

    }
})();
