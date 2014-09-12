'use strict';

angular.module('shipyard.utils', ['ngCookies'])
    .factory('AuthToken', function($cookieStore) {
        return {
            'get': function() {
                return $cookieStore.get('auth_token');
            },
            'getUsername': function() {
                return $cookieStore.get('auth_username');
            },
            'save': function(username, token) {
                var token = username + ":" + token;
                $cookieStore.put('auth_username', username);
                $cookieStore.put('auth_token', token);
            },
            'delete': function() {
                $cookieStore.remove('auth_username');
                $cookieStore.remove('auth_token');
            },
            'isLoggedIn': function() {
                var loggedIn = false;
                var token = $cookieStore.get('auth_token');
                if (token != undefined) {
                    loggedIn = true;
                }
                return loggedIn;
            }
        }
    });

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

