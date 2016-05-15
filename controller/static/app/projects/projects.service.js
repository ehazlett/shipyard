(function(){
    'use strict';

    angular
        .module('shipyard.projects')
        .factory('ProjectService', ProjectService)

    ProjectService.$inject = ['$http', '$q', '$rootScope'];
    function ProjectService($http, $q, $rootScope) {
        var cancelerGetPublicRegistryTags = null;

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
            buildResults: function(projectId, testId, buildId) {
                var promise = $http
                    .get('/api/projects/' + projectId + '/tests/' + testId + '/builds/' + buildId + '/results')
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
            getPublicRegistryTags: function(imageName) {
                cancelerGetPublicRegistryTags = $q.defer();
                var promise = $http
                    .get('/api/v1/repositories/tags?r='+imageName, {timeout: cancelerGetPublicRegistryTags.promise})
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            cancelGetPublicRegistryTags: function() {
                if (cancelerGetPublicRegistryTags === null) {
                    console.log("Couldn't cancel getPublicRegistryTags. Canceler not set.");
                    return false;
                }

                cancelerGetPublicRegistryTags.resolve();
                
                return true;
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
            updateTest: function(projectId, test) {
                var promise = $http
                    .put('/api/projects/' + projectId + '/tests/' + test.id, test)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            getParameters: function() {
                var promise = $http
                    .get('/api/parameters')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            updateImage: function(projectId, image) {
                var promise = $http
                    .put('/api/projects/' + projectId + '/images/' + image.id, image)
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
            },
        ///api/projects/:id/tests/:testId/builds
            //BuildAction action: enum: ["start", "restart", "stop"]
            executeBuild: function(projectId, testId, buildAction) {
                $rootScope.skipSpinnerInterceptorList.push(testId);
                var promise = $http
                    .post('/api/projects/' + projectId + '/tests/' + testId + '/builds', buildAction)
                    .then(function(response) {
                        var interceptorEntry = $rootScope.skipSpinnerInterceptorList.indexOf(testId);
                        $rootScope.skipSpinnerInterceptorList.splice(interceptorEntry, 1);
                        return response.data;
                    });
                return promise;
            },
        ///api/projects/:id/tests/:testId/builds/:buildId
            pollBuild: function(projectId, testId, buildID) {
                $rootScope.skipSpinnerInterceptorList.push(testId);
                var deferred = $q.defer();

                (function poll() {
                    $http
                        .get('/api/projects/' + projectId + '/tests/' + testId + '/builds/' + buildID)
                        .then(function(response) {
                            console.log("completed poll");
                            if (response.data.status.status === 'finished_success'
                                || response.data.status.status === 'finished_failed') {
                                deferred.resolve(response.data.status.status);
                                var interceptorEntry = $rootScope.skipSpinnerInterceptorList.indexOf(testId);
                                $rootScope.skipSpinnerInterceptorList.splice(interceptorEntry, 1);
                            } else {
                                setTimeout(function(){ poll(); }, 2000);
                            }
                        });
                })();

                return deferred.promise;
            }
        }
    }

})();

