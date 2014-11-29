(function() {
    'use strict';

    angular
        .module('shipyard.engines')
        .factory('Engines', function($resource) {
            return $resource('/api/engines');
        })
        .factory('Engine', function($resource) {
            return $resource('/api/engines/:id', {id: '@id'}, {
                remove: { method: 'DELETE' },
                'save': { isArray: true, method: 'POST' },
                query: { isArray: false }
            });
        });
})()

