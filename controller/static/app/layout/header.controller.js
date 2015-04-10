(function(){
    'use strict';

    angular
        .module('shipyard.layout')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$http', '$scope', 'authtoken'];

    function HeaderController($http, $scope, authtoken) {
        $scope.template = 'app/layout/header.html';
        $scope.username = authtoken.getUsername();
        $scope.isLoggedIn = authtoken.isLoggedIn();
    }
})()
