(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .factory('ContainerService', ContainerService)

        ContainerService.$inject = ['$http'];
    function ContainerService($http) {
        return {
            list: function() {
                var promise = $http
                    .get('/containers/json?all=1')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            inspect: function(containerId) {
                var promise = $http
                    .get('/containers/' + containerId + '/json')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            logs: function(containerId) {
                var promise = $http
                    .get('/containers/' + containerId + '/logs?stderr=1&stdout=1&timestamps=1')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            'top': function(containerId) {
                var promise = $http
                    .get('/containers/' + containerId + '/top')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            stats: function(containerId) {
                var promise = $http
                    .get('/containers/' + containerId + '/stats')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            destroy: function(containerId) {
                var promise = $http
                    .delete('/containers/' + containerId + '?v=1&force=1')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            stop: function(containerId) {
                var promise = $http
                    .post('/containers/' + containerId + '/stop')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            pause: function(containerId) {
                var promise = $http
                    .post('/containers/' + containerId + '/pause')
                    .then(function(response) {
                        return response.data;
                    })
                return promise;
            },
            unpause: function(containerId) {
                var promise = $http
                    .post('/containers/' + containerId + '/unpause')
                    .then(function(response) {
                        return response.data;
                    })
                return promise;
            },
            restart: function(containerId) {
                var promise = $http
                    .post('/containers/' + containerId + '/restart')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            scale: function(containerId, numOfInstances) {
                var promise = $http
                    .post('/api/containers/' + containerId + '/scale?n=' + numOfInstances)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            rename: function(old, newName) {
                var promise = $http
                    .post('/containers/' + old + '/rename?name=' + newName)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            commit: function(containerId, repoName) {
                var tag=""
                var index=repoName.lastIndexOf(":")
                if (index>0) {
                    tag=repoName.substring(index+1,repoName.length)
                    repoName=repoName.substring(0,index)
                }                 
                var promise = $http
                    .post('/commit?container=' + containerId + '&repo=' + repoName + '&tag=' + tag)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
        } 
    }


})();
