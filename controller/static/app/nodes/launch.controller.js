(function(){
    'use strict';

    angular
        .module('shipyard.nodes')
        .controller('LaunchNodeController', LaunchNodeController);

	LaunchNodeController.$inject = ['provider', 'NodesService', '$http', '$state', '$timeout'];
	function LaunchNodeController(provider, NodesService, $http, $state, $timeout) {
            var vm = this;
            vm.provider = provider;
            vm.launchNode = launchNode;
            vm.nodeName = "";
            vm.request = {};
            vm.params = {};
            vm.extraCreateArgs = "";
            vm.swarmToken = "";

            vm.formValidationRules = {
                name: {
                    identifier: 'name',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a name'
                        }
                    ]
                }
            };
            
            // TODO: not validating dynamic fields
            for (var i=0; i<vm.provider.params.length; i++) {
                var key = vm.provider.params[i].key;
                var required = vm.provider.params[i].required;
                vm.formValidationRules["v"+i] = {
                    identifier: key,
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter a ' + key
                        }
                    ]
                }
            }
            $('.ui.form').form(vm.formValidationRules);

            function isFormValid() {
                return $('.ui.form').form('validate form');
            }


            function launchNode() {
                if (!isFormValid()) {
                    return;
                }

                var params = [];
                for (var prop in vm.params) {
                    var arg = '--' + prop + '=' + vm.params[prop];
                    params.push(arg);
                }

                if (vm.extraParams != null) {
                    var extraParams = vm.extraParams.split(" ");
                    for (var i=0; i<extraParams.length; i++) {
                        params.push(extraParams[i]);
                    }
                }

                vm.request = {
                    name: vm.nodeName,
                    driver_name: provider.driver_name,
                    swarm_token: vm.swarmToken,
                    params: params
                }

                $http
                    .post('/api/nodes', vm.request)
                    .success(function(data, status, headers, config) {
                        $state.transitionTo('dashboard.nodes');
                    })
                    .error(function(data, status, headers, config) {
                        vm.error = data;
                    });
            }
	}
})();
