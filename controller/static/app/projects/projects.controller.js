
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

        vm.projectStatusText = "";
        vm.nodeName = "";
        vm.projectName = "";
        vm.checked = {};
        vm.checkedItemCount = 0;
        vm.checkedAll = false;


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
            angular.forEach(vm.checked, function (s) {
                if(s.checked) {
                    count += 1;
                }
            });
            vm.checkedItemCount = count;
        });

        // Remove checked items that are no longer visible
        $scope.$watchCollection('filteredProjects', function () {
            angular.forEach(vm.checked, function(s) {
                if(vm.checked[s.Id].Checked == true) {
                    var isVisible = false
                    angular.forEach($scope.filteredProjects, function(c) {
                        if(c.Id == s.Id) {
                            isVisible = true;
                            return;
                        }
                    });
                    vm.checked[s.Id].Checked = isVisible;
                }
            });
            return;
        });

        function checkAll() {
            angular.forEach($scope.filteredContainers, function (container) {
                vm.checked[container.Id].Checked = vm.checkedAll;
            });
        }

        function refresh() {
            ProjectService.list()
                .then(function(data) {
                    vm.projects = data;
                    angular.forEach(vm.projects, function (project) {
                        vm.checked[project.Id] = {Id: project.Id, Checked: vm.checkedAll};
                    });
                }, function(data) {
                    vm.error = data;
                });

            vm.error = "";
            vm.errors = [];
            vm.projects = [];
            vm.checked = {};
            vm.checkedItemCount = 0;
            vm.checkedAll = false;
        }

    }
})();
