(function(){
	'use strict';

	angular
		.module('shipyard.images')
		.controller('ImagesController', ImagesController);

	ImagesController.$inject = ['images', 'ImagesService', '$state', '$timeout'];
	function ImagesController(images, ImagesService, $state, $timeout) {
            var vm = this;
            vm.images = images;
            vm.pulling = false;
            vm.selectedImage = null;
            vm.refresh = refresh;
            vm.removeImage = removeImage;
            vm.pullImage = pullImage;
            vm.pullImageName = "";
            vm.showRemoveImageDialog = showRemoveImageDialog;
            vm.showPullImageDialog = showPullImageDialog;

            function showRemoveImageDialog(image) {
                vm.selectedImage = image;
                $('.ui.small.remove.modal').modal('show');
            }

            function showPullImageDialog(image) {
                $('.ui.small.pull.modal').modal('show');
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
                        vm.refresh();
                        vm.error = "";
                    }, function(data) {
                        console.log(data);
                        vm.error = data;
                    });
            }

            function pullImage() {
                vm.pulling = true;
                // this is to prevent errors in the console since we
                // get a stream like response back
                oboe({
                    url: '/images/create?fromImage=' + vm.pullImageName,
                    method: "POST"
                })
                .done(function() {
                    setTimeout(vm.refresh, 2000)
                    vm.pulling = false;
                    vm.pullImageName = "";
                })
                .fail(function(err) {
                    vm.error = err;
                });
            }
	}
})();
