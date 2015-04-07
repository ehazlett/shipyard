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
                    .get('/api/repositories')
                    .then(function(response) {
                        return response.data;
                    });
                return promise;
            },
        } 
    }
})();
