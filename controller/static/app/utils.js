function setActiveMenuItem(name) {
    $("div#menu-main a.item").removeClass("active");
    $("div#menu-main a#"+name).addClass("active");
}

function drawDashboardCharts(reservedCpu, totalCpu, reservedMemory, totalMemory) {
    var cpuData = [
        {
            "label": "Used",
            "value": reservedCpu
        },
        {
            "label": "Total",
            "value": totalCpu
        }
    ]
    var memoryData = [
        {
            "label": "Used",
            "value": reservedMemory
        },
        {
            "label": "Total",
            "value": totalMemory
        }
    ]
    nv.addGraph(function() {
        var chart = nv.models.pieChart()
              .x(function(d) { return d.label })
              .y(function(d) { return d.value })
              .donut(true)
              .donutRatio(0.4)
              .showLabels(true);
        
        d3.select("#chart-cpu svg")
            .datum(cpuData)
            .transition().duration(1200)
            .call(chart);
        return chart;
    });
    nv.addGraph(function() {
        var chart = nv.models.pieChart()
              .x(function(d) { return d.label })
              .y(function(d) { return d.value })
              .donut(true)
              .donutRatio(0.4)
              .showLabels(true);
        
        d3.select("#chart-memory svg")
            .datum(memoryData)
            .transition().duration(1200)
            .call(chart);
        return chart;
    });
}
