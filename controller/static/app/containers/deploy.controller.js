(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .controller('DeployController', DeployController);

    DeployController.$inject = ['$scope', '$location', 'Engines', 'Container'];

    function DeployController($scope, $location, Engines, Container) {
        var types = [
            "service",
            //"engine", // removed until we get the UI to show engines to select
            "unique"
        ];
        var networkModes = [
            "bridge",
            "none",
            "container",
                "host"
        ]
        var restartPolicies = [
        "no",
        "on-failure",
        "always"
        ]
        $scope.cpus = 0.1;
        $scope.memory = 256;
        $scope.maxRestarts = "";
        $scope.environment = "";
        $scope.hostname = "";
        $scope.domain = "";
        $scope.count = 1;
        $scope.publish = false;
        $scope.args = null;
        $scope.links = null;
        $scope.volumes = null;
        $scope.pull = true;
        $scope.types = types;
        $scope.selectType = function(type) {
            $scope.selectedType = type;
            $(".ui.dropdown").dropdown('hide');
        };
        $scope.selectedNetworkMode = 'bridge';
        $scope.networkModes = networkModes;
        $scope.selectNetworkMode = function(mode) {
            $scope.selectedNetworkMode = mode;
            if (mode === 'container') {
                $scope.showNetworkModeContainer = true;
            } else {
                $scope.showNetworkModeContainer = false;
            }
            $(".ui.dropdown").dropdown('hide');
        };
        $scope.selectedRestartPolicy = 'no';
        $scope.restartPolicies = restartPolicies;
        $scope.selectRestartPolicy = function(policy) {
            $scope.selectedRestartPolicy = policy;
            if (policy == 'on-failure') {
                $scope.showMaxRestarts = true;
            } else {
                $scope.showMaxRestarts = false;
            }
            $(".ui.dropdown").dropdown('hide');
        }
        var labels = [];
        Engines.query(function(engines){
            angular.forEach(engines, function(e) {
                angular.forEach(e.engine.labels, function(l){
                    if (labels.indexOf(l) == -1) {
                        this.push(l);
                    }
                }, labels);
            });
            $scope.labels = labels;
        });
        $scope.addPortDefinition = addPortDefinition;
        $scope.showLoader = function() {
            $(".ui.loader").removeClass("disabled");
            $(".ui.active").addClass("dimmer");
        };
        $scope.hideLoader = function() {
            $(".ui.loader").addClass("disabled");
            $(".ui.active").removeClass("dimmer");
        };
        $scope.deploy = function() {
            $scope.showLoader();
            var valid = $(".ui.form").form('validate form');
            if (!valid) {
                $scope.hideLoader();
                return false;
            }
            var selectedLabels = [];
            $(".ui.checkbox.engine-label").children(":checked").each(function(i, sel){
                // HACK: use the label text to set the value
                selectedLabels.push($(sel).next().text());
            });
            // format environment
            var envParts = $scope.environment.match(/(?:['"].+?['"])|\S+/g);
            var environment = {};
            if (envParts != null) {
                for (var i=0; i<envParts.length; i++) {
                    var env = envParts[i].split(/=(.+)?/)
                        environment[env[0]] = env[1];
                }
            }
            if ($scope.args != null) {
                var args = $scope.args.split(" ");
            }
            // network mode
            var networkMode = $scope.selectedNetworkMode;
            if ($scope.selectedNetworkMode == 'container') {
                var containerName = $scope.networkModeContainerName;
                networkMode = 'container:' + containerName;
                if (containerName == undefined || containerName == "") {
                    $("div#networkMode").addClass("error");
                    $scope.error = "you must specify a container name for the container network mode";
                    $scope.hideLoader();
                    valid = false;
                    return false;
                }
            }
            // links
            var links = {};
            if ($scope.links != null) {
                var linkParts = $scope.links.split(" ");
                if (linkParts != "") {
                    for (var i=0; i<linkParts.length; i++) {
                        var l = linkParts[i].split(":");
                        links[l[0]] = l[1];
                    }
                }
            }
            // volumes
            var volumes = [];
            if ($scope.volumes != null) {
                var volParts = $scope.volumes.split(" ");
                if (volParts != "") {
                    for (var i=0; i<volParts.length; i++) {
                        volumes.push(volParts[i]);
                    }
                }
            }
            // ports
            var ports = [];
            $(".ui.segment.ports").children("div.four.fields").each(function(i, el){
                var portSpecs = $(el).children("div").children("div");
                var portDef = {};
                var proto = $(portSpecs[0]).children(":input")[0].value;
                var ip = $(portSpecs[1]).children(":input")[0].value;
                var port = $(portSpecs[2]).children(":input")[0].value;
                var container_port = $(portSpecs[3]).children(":input")[0].value;
                portDef["proto"] = proto;
                portDef["host_ip"] = ip || null;
                portDef["port"] = parseInt(port);
                portDef["container_port"] = parseInt(container_port) || null;
                ports.push(portDef);
                if (portDef["proto"] == "" || portDef["container_port"] == null) {
                    $(portSpecs[0]).addClass("error");
                    $(portSpecs[3]).addClass("error");
                    $scope.error = "you must specify a protocol and container port for port bindings";
                    $scope.hideLoader();
                    valid = false;
                    return false;
                }
            });
            var restartPolicy = {
                name: $scope.selectedRestartPolicy,
            }
            var maxRestarts = parseInt($scope.maxRestarts);
            if(maxRestarts > 0) {
                restartPolicy.maximum_retry = maxRestarts;
            }
            var params = {
                name: $scope.name,
                container_name: $scope.containerName,
                cpus: parseFloat($scope.cpus),
                memory: parseFloat($scope.memory),
                environment: environment,
                hostname: $scope.hostname,
                domain: $scope.domain,
                type: $scope.selectedType,
                network_mode: networkMode,
                args: args,
                links: links,
                volumes: volumes,
                bind_ports: ports,
                labels: selectedLabels,
                publish: $scope.publish,
                restart_policy: restartPolicy,
            };
            if (valid) {
                Container.save({count: $scope.count, pull: $scope.pull}, params).$promise.then(function(c){
                    $location.path("/containers");
                }, function(err){
                    $scope.hideLoader();
                    $scope.error = err.data;
                    return false;
                });
            }
        };
    }
})()
