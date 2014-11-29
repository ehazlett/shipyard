(function() {
    'use strict';

    angular
        .module('shipyard.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$http', 'Events', 'ClusterInfo', 'authtoken'];

    function DashboardController($http, Events, ClusterInfo, authtoken) {
        var vm = this;

        Events.query(function(data){
            vm.events = data;
        });
        vm.showX = function(){
            return function(d){
                return d.key;
            };
        };
        vm.showY = function(){
            return function(d){
                return d.y;
            };
        };
        ClusterInfo.query(function(data){
            vm.chartOptions = {};
            vm.clusterInfo = data;
            vm.clusterCpuData = [
                { label: "Free", value: data.cpus, color: "#184465" },
                { label: "Reserved", value: 0, color: "#6D91AD" }
            ];
            if (data.cpus != undefined && data.reserved_cpus != undefined) {
                vm.clusterCpuData[0].value = data.cpus - data.reserved_cpus;
                vm.clusterCpuData[1].value = data.reserved_cpus;
            }
            vm.clusterMemoryData = [
                { label: "Free", value: data.memory, color: "#184465" },
                { label: "Reserved", value: 0, color: "#6D91AD" }
            ];
            if (data.memory != undefined && data.reserved_memory != undefined) {
                vm.clusterMemoryData[0].value = data.memory - data.reserved_memory;
                vm.clusterMemoryData[1].value = data.reserved_memory;
            }
        });
    }

})()
