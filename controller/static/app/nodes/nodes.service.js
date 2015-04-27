(function(){
	'use strict';

	angular
		.module('shipyard.nodes')
        .factory('NodesService', NodesService);

	NodesService.$inject = ['$http'];
        function NodesService($http) {
            return {
                list: function() {
                    var promise = $http
                        .get('/api/nodes')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                removeNode: function(node) {
                    var promise = $http
                        .delete('/api/nodes/' + node.name)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                providers: function() {
                    var promise = $http
                        .get('/api/providers/node')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                provider: function(name) {
                    var promise = $http
                        .get('/api/providers/node/' + name)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
            } 
        } 
})();
