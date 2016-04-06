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
            //getImages: function() {
            //    var promise = $http
            //        .get('/api/projects/location')
            //        .then(function(response) {
            //            return response.data;
            //        });
            //    return promise;
            //},
            getPublicRegistryTags: function(imageName) {
                var promise = $http
                    .get('/api/v1/repositories/tags?r='+imageName)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            getProviders: function() {
                var promise = $http
                    .get('/api/providers')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            deleteTest: function(projectId, testId) {
                var promise = $http
                    .delete('/api/projects/' + projectId + '/tests/' + testId)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            getTests: function(projectId) {
                var promise = $http
                    .get('/api/projects/' + projectId + '/tests')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            getImages: function(projectId) {
                var promise = $http
                    .get('/api/projects/' + projectId + '/images')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            addImage: function(projectId, image) {
                var promise = $http
                    .post('/api/projects/' + projectId + '/images', image)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            addTest: function(projectId, test) {
                var promise = $http
                    .post('/api/projects/' + projectId + '/tests', test)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            }
        }
    }

})();

