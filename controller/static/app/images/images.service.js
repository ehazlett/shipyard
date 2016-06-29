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
                        .get('/images/json')
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
                },
                tag: function(image, tagName)  {
                    var versionTag=""
                    var colonIndex=tagName.lastIndexOf(":")
                    var slashIndex=tagName.lastIndexOf("/")
                    if (colonIndex>0 && colonIndex > slashIndex) {
                        versionTag=tagName.substring(colonIndex+1,tagName.length)
                        tagName=tagName.substring(0,colonIndex)
                    }
                    var promise = $http
                        .post('/images/' + image.Id + '/tag?repo=' + tagName + '&tag='+ versionTag )
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                }
            } 
        } 
})();
