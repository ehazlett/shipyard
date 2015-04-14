(function() {
    'use strict';

    angular
        .module('shipyard')
        .service('401interceptor', function($rootScope) {
            var service = this;
            service.responseError = function(response) {
                if(response.status === 401) {
                    $rootScope.$state.go('login');
                }
                return response;
            };
        })
        .config([
                '$httpProvider',
                'jwtInterceptorProvider', 
                function ($httpProvider, jwtInterceptorProvider) {
                    jwtInterceptorProvider.tokenGetter = function() {
                        // Temporary solution to get angular-jwt to use our header format
                        jwtInterceptorProvider.authHeader = "X-Access-Token";
                        jwtInterceptorProvider.authPrefix = "";

                        return localStorage.getItem('X-Access-Token');
                    };

                    $httpProvider.interceptors.push('jwtInterceptor');
                    $httpProvider.interceptors.push('401interceptor');
                }
        ]);
})();

