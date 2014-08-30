'use strict';

angular.module('shipyard.services', ['ngResource', 'ngRoute'])
    .factory('Login', function($resource) {
        return $resource('/auth/login', [], {
            query: { isArray: false },
            'login': { method: 'POST', isArray: false }
        });
    })
    .factory('Containers', function($resource) {
        return $resource('/api/containers');
    })
    .factory('Container', function($resource) {
        return $resource('/api/containers/:id', {id: '@id'}, {
            query: { isArray: false }
        });
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
