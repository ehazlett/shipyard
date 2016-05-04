(function(){
    'use strict';

    angular
        .module('shipyard.registry')
        .factory('RegistryService', RegistryService)

    RegistryService.$inject = ['$http'];
    function RegistryService($http) {
        return {
            list: function() {
                var promise = $http
                    .get('/api/registries')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            inspectRegistry: function(name) {
                var promise = $http
                    .get('/api/registries/'+name)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            inspectRepository: function(registryId, repositoryName, repositoryTag) {
                var promise = $http
                    .get('/api/registries/'+registryId +'/repositories/'+repositoryName+':'+repositoryTag)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            listRepositories: function(name) {
                var promise = $http
                    .get('/api/registries/'+name+'/repositories')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            removeRegistry: function(registry) {
                var promise = $http
                    .delete('/api/registries/'+registry.id)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            removeRepository: function(registryId, repo) {
                var tag = repo.tag ? ":" + repo.tag : "";
                var promise = $http
                    .delete('/api/registries/'+registryId+'/repositories/'+repo.name+tag)
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
            listDockerhubRepos: function(repo) {
                var promise = $http
                    .get("https://index.docker.io/v1/search?q=" + repo + "*&page=1&n=25")
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
        } 
    }
})();
