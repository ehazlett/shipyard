(function(){
	'use strict';

	angular
	    .module('shipyard.images')
            .factory('ImagesService', ImagesService);

	ImagesService.$inject = ['$http'];
        function ImagesService($http) {
            return {
                list: function() {
                    var promise = $http
                        .get('/images/json?all=1')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                remove: function(image) {
                    var promise = $http
                        .delete('/images/' + image.Id + '?force=1')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                }
            } 
        } 
})();
