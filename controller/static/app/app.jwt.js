(function() {
    'use strict';

    angular
        .module('shipyard')
        .config([
                '$httpProvider',
                'jwtInterceptorProvider', 
                function ($httpProvider, jwtInterceptorProvider) {
                    jwtInterceptorProvider.tokenGetter = ['authtoken', function(authtoken) {
                        // Temporary solution to get angular-jwt to use our header format
                        jwtInterceptorProvider.authHeader = "X-Access-Token";
                        jwtInterceptorProvider.authPrefix = "";

                        return localStorage.getItem('X-Access-Token');
                    }];

                    $httpProvider.interceptors.push('jwtInterceptor');
                }
        ]);
})();

