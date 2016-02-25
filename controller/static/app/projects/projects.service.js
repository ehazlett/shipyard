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
            edit: function(projectId) {
                var promise = $http
                    .get('/api/projects/' + projectId)
                    .then(function(response) {
                        console.log(response.data);
                        return response.data;
                    });
                return promise;
            },
            update: function(projectId, data) {
                var promise = $http
                    .put('/api/project/' + projectId, data)
                    .then(function(response) {
                        return response.data;
                    });
            },
            destroy: function(projectId) {
                var promise = $http
                    .delete('/api/projects/' + projectId)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            create: function(data) {
                var promise = $http
                    .post('/api/projects/', data)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            }
        }
    }

})();

