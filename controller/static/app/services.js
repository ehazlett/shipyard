'use strict';

angular.module('shipyard.services', ['ngResource'])
    .factory('Containers', function($resource) {
        return $resource('/api/containers');
    })
    .factory('Engines', function($resource) {
        return $resource('/api/engines');
    });
