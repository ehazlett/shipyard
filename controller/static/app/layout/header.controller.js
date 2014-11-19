(function(){
    'use strict';

    angular
        .module('shipyard.layout')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$http', '$scope', 'AuthToken'];

    function HeaderController($http, $scope, AuthToken) {
        $scope.template = 'app/layout/header.html';
        $scope.username = AuthToken.getUsername();
        $scope.isLoggedIn = AuthToken.isLoggedIn();
        $http.defaults.headers.common['X-Access-Token'] = AuthToken.get();
    }
})()
