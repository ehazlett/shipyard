'use strict';

angular.module('shipyard.services', ['ngResource', 'ngRoute'])
    .factory('Login', function($resource) {
        return $resource('/auth/login', [], {
            query: { isArray: false },
            'login': { method: 'POST', isArray: false }
        });
    })
    .factory('ClusterInfo', function($resource) {
        return $resource('/api/cluster/info', [], {
            query: { isArray: false }
        });
    });
