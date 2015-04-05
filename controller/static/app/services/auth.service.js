(function(){
    'use strict';

    angular
        .module('shipyard.services')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$http', '$state'];
    function AuthService($http, $state) {
        return {
            login: function(credentials) {
                $http
                    .post('/auth/login', credentials)
                    .success(function(data, status, headers, config) {
                        localStorage.setItem('X-Access-Token', credentials.username + ':' + data.auth_token);
                        $state.transitionTo('dashboard.containers');
                    })
                    .error(function(data, status, headers, config) {
                        localStorage.removeItem('X-Access-Token');
                    });
            },
            logout: function() {
                localStorage.removeItem('X-Access-Token');
            },
            isLoggedIn: function() {
                return localStorage.getItem('X-Access-Token') != null;
            },
            getUsername: function() {
                var token = localStorage.getItem('X-Access-Token');
                if(token == null) {
                    return "";
                }
                return token.split(':')[0];
            }
        };
    }
})();

