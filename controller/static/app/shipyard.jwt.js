(function() {
    'use strict';

    angular
        .module('shipyard')
        .service('spinnerInterceptor', function($q, $rootScope) {
            var service = this;
            var nLoadings = 0;
            service.request = function(request) {
                nLoadings += 1;
                $rootScope.isLoadingView = true;
                return request;
            }
            service.response = function(response) {
                nLoadings -= 1;
                if (nLoadings === 0) {
                    $rootScope.isLoadingView = false;
                }
                return response;
            };
            service.responseError = function(response) {
                nLoadings -= 1;
                if (!nLoadings) {
                    $rootScope.isLoadingView = false;
                }
                return $q.reject(response);
            };
        })
    .service('401interceptor', function($rootScope) {
        var service = this;
        service.responseError = function(response) {
            if(response.status === 401) {
                $rootScope.$state.go('login');
            }
            return response;
        };
    })
    .service('403interceptor', function($rootScope) {
        var service = this;
        service.responseError = function(response) {
            if(response.status === 403) {
                $rootScope.$state.go('403');
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
                $httpProvider.interceptors.push('spinnerInterceptor');
                $httpProvider.interceptors.push('401interceptor');
                $httpProvider.interceptors.push('403interceptor');
            }
    ]);
})();

