'use strict';

function setActiveMenuItem(name) {
    $("div#menu-main a.item").removeClass("active");
    $("div#menu-main a#"+name).addClass("active");
}

function drawDashboardCharts(reservedCpu, totalCpu, reservedMemory, totalMemory) {
    var cpuData = [
        {
            "label": "Used",
            "value": reservedCpu || 0.0
        },
        {
            "label": "Total",
            "value": totalCpu || 0.0
        }
    ]
    var memoryData = [
        {
            "label": "Used",
            "value": reservedMemory || 0.0
        },
        {
            "label": "Total",
            "value": totalMemory || 0.0
        }
    ]
    nv.addGraph(function() {
        var chart = nv.models.pieChart()
              .x(function(d) { return d.label })
              .y(function(d) { return d.value })
              .donut(true)
              .donutRatio(0.35)
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
              .donutRatio(0.35)
              .showLabels(true);
        
        d3.select("#chart-memory svg")
            .datum(memoryData)
            .transition().duration(1200)
            .call(chart);
        return chart;
    });
}

function getToken() {
    //return 'admin:$2a$10$0QTBoG3R/rxj.Aasmo4oHOIWu/5Vi9HwQjCQbWFnwQB9/9K3kgHHK';
    return 'admin:foo';
}

function isLoggedIn() {
    return true;
}

function getRandomColor() {
    var colors = d3.scale.category20c().range();
    var rand = colors[Math.floor(Math.random() * colors.length)];
    return rand
}

function addPortDefinition() {
    $(".ui.ports.default-label").remove();
    var idx = $(".ui.segment.ports").children("div").length;
    $(".ui.segment.ports").append(' \
                <div class="four fields"> \
                    <div class="field"> \
                        <label>Protocol</label> \
                        <div class="ui dropdown selection"> \
                            <input id="protocol' + idx + '"type="hidden" name="protocol" class="ui input notEmpty"> \
                            <div class="default text">...</div> \
                                <i class="dropdown icon"></i> \
                                <div class="menu"> \
                                    <div class="item" data-value="tcp">TCP</div> \
                                <div class="item" data-value="udp">UDP</div> \
                            </div> \
                        </div> \
                    </div> \
                    <div class="field"> \
                        <label>IP</label> \
                        <div class="ui left labeled input"> \
                            <input type="text" placeholder="0.0.0.0"> \
                        </div> \
                    </div> \
                    <div class="field"> \
                        <label>Port</label> \
                        <div class="ui left labeled input"> \
                            <input type="text" placeholder=""> \
                        </div> \
                    </div> \
                    <div class="field"> \
                        <label>Container Port</label> \
                        <div class="ui left labeled input"> \
                            <input id="container_port' + idx + '" type="text" placeholder="" name="container_port" class="ui input notEmpty"> \
                        </div> \
                    </div> \
                </div>');
    $(".ui.dropdown").dropdown();
    setValidationRules();
}
