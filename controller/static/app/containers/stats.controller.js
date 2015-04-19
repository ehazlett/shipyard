(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('ContainerStatsController', ContainerStatsController);

    ContainerStatsController.$inject = ['$stateParams', '$scope'];
    function ContainerStatsController($stateParams, $scope) {
        var vm = this;
        var graphCpuStats;
        var graphMemoryStats;
        var graphNetStats;
        vm.refreshInterval = 2;
        vm.id = $stateParams.id;

        vm.cpuStats = [{
            key: "CPU",
            values: []
        }];

        vm.memoryStats = [{
            key: "Memory",
            color: '#ffa500',
            values: []
        }];

        vm.netStats = [
        {
            key: "Network (rx)",
            values: []
        },
        {
            key: "Network (tx)",
            values: []
        }
        ];

        vm.x = 0;


        var previousCpuUsage = 0;
        var previousSystemCpuUsage = 0;
        function addCpuUsage(date, systemUsage, usage, cpuCores) {
            if(previousCpuUsage == 0 || previousSystemCpuUsage == 0) {
                previousCpuUsage = usage;
                previousSystemCpuUsage = systemUsage;
                return;
            }

            var usageSample = usage - previousCpuUsage
                previousCpuUsage = usage;

            var systemUsageSample = systemUsage - previousSystemCpuUsage;
            previousSystemCpuUsage = systemUsage;

            var cpuPercent = 0.0;
            if(usageSample > 0.0 && systemUsageSample > 0.0) {
                cpuPercent = (usageSample / systemUsageSample) * cpuCores * 100.0;
            }                

            var stat = { x: date, y: cpuPercent };
            vm.cpuStats[0].values.push(stat);
            if (vm.cpuStats[0].values.length > 20) {
                vm.cpuStats[0].values.shift();
            }

        }

        function addMemoryUsage(date, usage) {
            var stat = { x: date, y: usage };
            vm.memoryStats[0].values.push(stat);
            if (vm.memoryStats[0].values.length > 20) {
                vm.memoryStats[0].values.shift();
            }
        }

        function addNetworkUsage(date, rxUsage, txUsage) {
            var rxStat = { x: date, y: rxUsage };
            vm.netStats[0].values.push(rxStat);
            if (vm.netStats[0].values.length > 20) {
                vm.netStats[0].values.shift();
            }

            var txStat = { x: date, y: txUsage };
            vm.netStats[1].values.push(txStat);
            if (vm.netStats[1].values.length > 20) {
                vm.netStats[1].values.shift();
            }
        }

        nv.addGraph(function() {
            graphCpuStats = nv.models.lineChart()
                .options({
                    transitionDuration: 300,
                    noData: "Loading...",
                })
            ;
            graphCpuStats
                .x(function(d,i) { return d.x });
            graphCpuStats.xAxis // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
                .tickFormat(function(d) { return d3.time.format('%H:%M:%S')(new Date(d));  })
                .axisLabel('')
                ;
            graphCpuStats
                graphCpuStats.yAxis
                .axisLabel('%')
                .tickFormat(d3.format(',.2f'));
            graphCpuStats.showXAxis(true).showYAxis(true).rightAlignYAxis(true).margin({right: 90});
            d3.select('#graphCpuStats svg')
                .datum(vm.cpuStats)
                .transition().duration(500)
                .call(graphCpuStats);
            nv.utils.windowResize(graphCpuStats.update);
            return graphCpuStats;
        });

        nv.addGraph(function() {
            graphMemoryStats = nv.models.lineChart()
                .options({
                    transitionDuration: 300,
                    noData: "Loading...",
                })
            .forceY([0,1])
                ;
            graphMemoryStats
                .x(function(d,i) { return d.x });
            graphMemoryStats.xAxis // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
                .tickFormat(function(d) { return d3.time.format('%H:%M:%S')(new Date(d));  })
                .axisLabel('')
                ;
            graphMemoryStats
                graphMemoryStats.yAxis
                .axisLabel('MB')
                .tickFormat(d3.format(',.2f'));
            graphMemoryStats.showXAxis(true).showYAxis(true).rightAlignYAxis(true).margin({right: 90});
            d3.select('#graphMemoryStats svg')
                .datum(vm.memoryStats)
                .transition().duration(500)
                .call(graphMemoryStats);
            nv.utils.windowResize(graphMemoryStats.update);
            return graphMemoryStats;
        });

        nv.addGraph(function() {
            graphNetStats = nv.models.lineChart()
                .options({
                    transitionDuration: 300,
                    noData: "Loading...",
                })
            ;
            graphNetStats
                .x(function(d,i) { return d.x });
            graphNetStats.xAxis // chart sub-models (ie. xAxis, yAxis, etc) when accessed directly, return themselves, not the parent chart, so need to chain separately
                .tickFormat(function(d) { return d3.time.format('%H:%M:%S')(new Date(d));  })
                .axisLabel('')
                ;
            graphNetStats
                graphNetStats.yAxis
                .axisLabel('MB')
                .tickFormat(d3.format(',.2f'));
            graphNetStats.showXAxis(true).showYAxis(true).rightAlignYAxis(true).margin({right: 90});
            d3.select('#graphNetStats svg')
                .datum(vm.netStats)
                .transition().duration(500)
                .call(graphNetStats);
            nv.utils.windowResize(graphNetStats.update);
            return graphNetStats;
        });

        var stream = oboe({
            url: '/containers/' + vm.id + '/stats',
            withCredentials: true,
            headers: {
                'X-Access-Token': localStorage.getItem("X-Access-Token")
            }
        })
        .done(function(node) {
            // stats come every 1 second; only update every 5
            if (vm.x % vm.refreshInterval === 0) {
                var timestamp = Date.parse(node.read);
                addCpuUsage(timestamp, node.cpu_stats.system_cpu_usage, node.cpu_stats.cpu_usage.total_usage, node.cpu_stats.cpu_usage.percpu_usage.length);
                // convert to MB
                addMemoryUsage(timestamp, node.memory_stats.usage / 1048576);
                // convert to MB
                addNetworkUsage(timestamp, node.network.rx_bytes / 1048576, node.network.tx_bytes / 1048576);
                refreshGraphs();
            }
            vm.x++;
        })
        .fail(function(err) {
            vm.error = err;
        })

        function refreshGraphs() {
            graphCpuStats.update();
            graphMemoryStats.update();
            graphNetStats.update();
        }

        $scope.$on("$destroy", function() {
            stream.abort();
        });

    }
})();
