(function(){
	'use strict';

	angular
		.module('shipyard.images')
		.controller('ImagesController', ImagesController);

	ImagesController.$inject = ['images', 'ImagesService', '$state', '$timeout'];
	function ImagesController(images, ImagesService, $state, $timeout) {
            var vm = this;
            vm.images = images;
            vm.selectedImage = null;
            vm.refresh = refresh;
            vm.removeImage = removeImage;
            vm.showRemoveImageDialog = showRemoveImageDialog;

            function showRemoveImageDialog(image) {
                vm.selectedImage = image;
                $('.ui.small.remove.modal').modal('show');
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
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            }
	}
})();
