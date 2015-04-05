(function(){
    'use strict';

    angular
        .module('shipyard.containers')
        .factory('ContainerService', ContainerService)
        .factory('ContainersService', ContainersService);

    ContainersService.$inject = ['$resource'];
    function ContainersService($resource) {
        return $resource('/containers/json?all=1');
    }

    ContainerService.$inject = ['$resource'];
    function ContainerService($resource) {
        return $resource('/containers/:id/:action', {id: '@id' }, {action: '@action'}, {
            kill: { method: 'DELETE' },
            control: { method: 'POST' },
            query: { isArray: false }
        });
    }


})();
