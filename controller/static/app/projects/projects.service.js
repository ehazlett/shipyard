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
                    .get('/projects/json?all=1')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
        }
    }


})();

