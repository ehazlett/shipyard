
(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .controller('ProjectsController', ProjectsController);

    ProjectsController.$inject = ['$scope', 'ProjectService', '$state'];
    function ProjectsController($scope, ProjectService, $state) {
        var vm = this;

        vm.error = "";
        vm.errors = [];
        vm.projects = [];

        vm.refresh = refresh;
        vm.projectStatusText = "";
        vm.nodeName = "";
        vm.projectName = "";
        vm.checkAll = "";


        refresh();

        // Apply jQuery to dropdowns in table once ngRepeat has finished rendering
        $scope.$on('ngRepeatFinished', function() {
            $('.ui.sortable.celled.table').tablesort();
            $('#select-all-table-header').unbind();
            $('.ui.right.pointing.dropdown').dropdown();
        });

        $('#multi-action-menu').sidebar({dimPage: false, animation: 'overlay', transition: 'overlay'});

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
        $scope.$watchCollection('filteredProjects', function () {
            angular.forEach(vm.selected, function(s) {
                if(vm.selected[s.Id].Selected == true) {
                    var isVisible = false
                    angular.forEach($scope.filteredProjects, function(c) {
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

        function refresh() {
            ProjectService.list()
                .then(function(data) {
                    vm.projects = data;
                    angular.forEach(vm.projects, function (project) {
                        vm.selected[project.Id] = {Id: project.Id, Selected: vm.selectedAll};
                    });
                }, function(data) {
                    vm.error = data;
                });

            vm.error = "";
            vm.errors = [];
            vm.projects = [];
        }

    }
})();
