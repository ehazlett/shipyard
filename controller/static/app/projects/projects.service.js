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
            results: function(projectId) {
                var promise = $http
                    .get('/api/projects/' + projectId + '/results')
                    .then(function(response) {
                        console.log(response.data);
                        return response.data;
                    });
                return promise;
            },
            update: function(projectId, data) {
                var promise = $http
                    .put('/api/projects/' + projectId, data)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
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
                    .post('/api/projects', data)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            delete: function(projectId, imageId) {
                var promise = $http
                    .delete('/api/projects/' + projectId + '/images/' + imageId)
                    .then(function(response) {
                        return response.data;
                });
                return promise;
            },
            getImages: function() {
                var promise = $http
                    .get('/api/projects/location')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            getPublicRegistryTags: function(imageName) {
                var promise = $http
                    .get('https://registry.hub.docker.com/v1/repositories/'+imageName+'/tags')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            }
        }
    }

})();

