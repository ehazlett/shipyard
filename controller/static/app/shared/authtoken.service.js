(function(){
    'use strict';

    angular
        .module('shipyard.shared')
        .factory('authtoken', authtoken);

    authtoken.$inject = ['$cookieStore'];

    function authtoken($cookieStore) {
        return {
            'get': function() {
                return $cookieStore.get('auth_token');
            },
            'getUsername': function() {
                return $cookieStore.get('auth_username');
            },
            'save': function(username, token) {
                var token = username + ":" + token;
                $cookieStore.put('auth_username', username);
                $cookieStore.put('auth_token', token);
            },
            'delete': function() {
                $cookieStore.remove('auth_username');
                $cookieStore.remove('auth_token');
            },
            'isLoggedIn': function() {
                var loggedIn = false;
                var token = $cookieStore.get('auth_token');
                if (token != undefined) {
                    loggedIn = true;
                }
                return loggedIn;
            }
        };
    }

})()
