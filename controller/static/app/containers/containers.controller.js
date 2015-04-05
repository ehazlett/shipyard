(function(){
	'use strict';

	angular
		.module('shipyard.containers')
		.controller('ContainersController', ContainersController);

	ContainersController.$inject = ['containers', 'ContainerService'];
	function ContainersController(containers, ContainerService) {
		var vm = this;
		vm.containers = containers;
        vm.selectedContainerId = "";
        vm.showDestroyContainerDialog = showDestroyContainerDialog;
        vm.destroyContainer = destroyContainer;

        ////
        
        function showDestroyContainerDialog(container) {
            vm.selectedContainerId = container.Id;
           $('.ui.small.destroy.modal').modal('show');
        }
        function destroyContainer() {
            console.log("Destroying " + vm.selectedContainerId);
            ContainerService.kill(vm.selectedContainerId);
        }
	}
})();
