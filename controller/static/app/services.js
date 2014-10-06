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
        return $resource('/api/containers/:id/:action', {id: '@id', action: '@action'}, {
            destroy: { method: 'DELETE' },
            'save': { isArray: true, method: 'POST' },
            'control': { isArray: false, method: 'GET'},
            query: { isArray: false }
        });
    })
    .factory('Engines', function($resource) {
        return $resource('/api/engines');
    })
    .factory('Engine', function($resource) {
        return $resource('/api/engines/:id', {id: '@id'}, {
            remove: { method: 'DELETE' },
            'save': { isArray: true, method: 'POST' },
            query: { isArray: false }
        });
    })
    .factory('Events', function($resource) {
        return $resource('/api/events');
    })
    .factory('ClusterInfo', function($resource) {
        return $resource('/api/cluster/info', [], {
            query: { isArray: false }
        });
    });
