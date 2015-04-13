(function() {
    'use strict';

    angular
        .module('shipyard')
        .service('APIInterceptor', function($rootScope) {
            var service = this;
            service.responseError = function(response) {
                if(response.status === 401) {
                    $rootScope.$state.go('login');
                }
                return response;
            };
        })
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('APIInterceptor');
    }
    ]);
})();

