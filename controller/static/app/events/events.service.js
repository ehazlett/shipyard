(function(){
    'use strict';

    angular
        .module('shipyard.events')
        .factory('Events', function($resource) {
            return $resource('/api/events', {}, {
                'purge': { isArray: false, method: 'DELETE' },
                query: { isArray: true }
            });
        });

})()
