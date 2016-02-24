
(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('CreateController', CreateController);

    CreateController.$inject = ['$scope', 'ProjectService', '$state'];
    function CreateController($scope, ProjectService, $state) {
        var vm = this;

        vm.saveProject = saveProject;
        vm.showImageCreateDialog = showImageCreateDialog;

        vm.project = {};
        vm.project.author = localStorage.getItem('X-Access-Token').split(":")[0];

        function saveProject(project){
            console.log("saving project" + project);
            ProjectService.create(project)
                .then(function(data) {
                    $state.transitionTo('dashboard.projects');
                }, function(data) {
                    vm.error = data;
                });
        }

        function showImageCreateDialog(id) {
            $('#image-edit-modal').modal('show');
        }
    }
})();
