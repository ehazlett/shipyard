(function(){
	'use strict';

	angular
		.module('shipyard.images')
		.controller('ImagesController', ImagesController);

	ImagesController.$inject = ['images', 'ImagesService', '$state', '$timeout', '$scope'];
	function ImagesController(images, ImagesService, $state, $timeout, $scope) {
            var vm = this;
            vm.images = images;
            vm.pulling = false;
            vm.selectedImage = null;
            vm.refresh = refresh;
            vm.removeImage = removeImage;
            vm.pullImage = pullImage;
            vm.pullImageName = "";
            vm.tagImage = tagImage;
            vm.tagImageName = "";
            vm.showTagImageDialog = showTagImageDialog;
            vm.showRemoveImageDialog = showRemoveImageDialog;
            vm.showPullImageDialog = showPullImageDialog;
            vm.error = "";

            function showTagImageDialog(image) {
                vm.selectedImage = image;
                $('#tag-modal').modal('show');
            }
            
            function showRemoveImageDialog(image) {
                vm.selectedImage = image;
                $('#remove-modal').modal('show');
            }

            function showPullImageDialog(image) {
                $('#pull-modal').modal('show');
            }

            function refresh() {
                ImagesService.list()
                    .then(function(data) {
                        vm.images = data; 
                    }, function(data) {
                        vm.error = data;
                    });
                    vm.error = "";
            }

            function removeImage() {
                ImagesService.remove(vm.selectedImage)
                    .then(function(data) {
                        vm.error = "";
                        vm.refresh();
                    }, function(data) {
                        vm.error = data.status + ": " + data.data;
                    });
            }
            
            function tagImage() {
                ImagesService.tag(vm.selectedImage, vm.tagImageName)
                    .then(function(data) {
                        vm.error = "";
                        vm.refresh();
                    }, function(data) {
                        vm.error = data.status + ": " + data.data;
                        vm.tagImageName = "";
                    });
            }

            function pullImage() {
                vm.error = "";
                vm.pulling = true;
                // this is to prevent errors in the console since we
                // get a stream like response back
                oboe({
                    url: '/images/create?fromImage=' + vm.pullImageName,
                    method: "POST",
                    withCredentials: true,
                    headers: {
                        'X-Access-Token': localStorage.getItem("X-Access-Token")
                    }
                })
                .done(function(node) {
                    // We expect two nodes, e.g.
                    // 1) Pulling busybox...
                    // 2) Pulling busybox... : downloaded
                    if(node.status && node.status.indexOf(":") > -1) {
                        if(node.status.indexOf("downloaded") == -1) {
                            $scope.$apply();
                        } else {
                            setTimeout(vm.refresh, 1000);
                        }
                    }
                    vm.pullImageName = "";
                    vm.pulling = false;
                })
                .fail(function(err) {
                    console.log(err);
                    vm.pulling = false;
                    vm.pullImageName = "";
                    vm.error = err;
                });
            }
	}
})();
