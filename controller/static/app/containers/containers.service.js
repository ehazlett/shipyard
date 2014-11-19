(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .factory('Containers', function($resource) {
            return $resource('/api/containers');
        })
        .factory('Container', function($resource) {
            return $resource('/api/containers/:id/:action', {id: '@id' }, {
                destroy: { method: 'DELETE' },
                'save': { isArray: true, method: 'POST' },
                'control': { isArray: false, method: 'GET' },
                query: { isArray: false }
            });
        });
})()
