(function(){
	'use strict';

	angular
    	    .module('shipyard.accounts')
            .factory('AccountsService', AccountsService);

	AccountsService.$inject = ['$http'];
        function AccountsService($http) {
            return {
                list: function() {
                    var promise = $http
                        .get('/api/accounts')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                roles: function() {
                    var promise = $http
                        .get('/api/roles')
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                role: function(name) {
                    var promise = $http
                        .get('/api/roles/'+name)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                getAccount: function(username) {
                    var promise = $http
                        .get('/api/accounts/' + username)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
                removeAccount: function(account) {
                    var promise = $http
                        .delete('/api/accounts/'+account.username)
                        .then(function(response) {
                            return response.data;
                        });
                    return promise;
                },
            } 
        } 
})();
