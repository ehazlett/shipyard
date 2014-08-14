'use strict';

angular.module('shipyard.services', ['ngResource'])
    .factory('Containers', function($resource) {
        return $resource('/api/containers');
    })
    .factory('Engines', function($resource) {
        return $resource('/api/engines');
    })
    .factory('Events', function($resource) {
        return $resource('/api/events');
    })
    .factory('ClusterInfo', function($resource) {
        return $resource('/api/cluster/info', [], {
            query: { isArray: false }
        });
    });
