(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .factory('ProjectService', ProjectService)

    ProjectService.$inject = ['$http'];
    function ProjectService($http) {
        return {
            list: function() {
                var promise = $http
                    .get('/api/projects')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            inspect: function(projectId) {
                var promise = $http
                    .get('/projects/' + projectId + '/json')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            edit: function(projectId) {
                var promise = $http
                    .get('/api/project/' + projectId)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            }
        }
    }


})();

