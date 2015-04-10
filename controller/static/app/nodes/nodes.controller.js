(function(){
	'use strict';

	angular
		.module('shipyard.nodes')
		.controller('NodesController', NodesController);

	NodesController.$inject = ['nodes', 'NodesService', '$state', '$timeout'];
	function NodesController(nodes, NodesService, $state, $timeout) {
            var vm = this;
            vm.nodes = nodes;
            vm.refresh = refresh;
            vm.removeNode = removeNode;
            vm.showRemoveNodeDialog = showRemoveNodeDialog;
            vm.selectedNode = null;

            function showRemoveNodeDialog(node) {
                vm.selectedNode = node;
                $('.ui.small.remove.modal').modal('show');
            }

            function refresh() {
                NodesService.list()
                    .then(function(data) {
                        vm.nodes = data; 
                    }, function(data) {
                        vm.error = data;
                    });
                vm.error = "";
            }
            
            function removeNode() {
                NodesService.removeNode(vm.selectedNode)
                    .then(function(data) {
                        vm.refresh();
                    }, function(data) {
                        vm.error = data;
                    });
            }

	}
})();
