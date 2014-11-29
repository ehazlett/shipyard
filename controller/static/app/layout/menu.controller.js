(function(){
    'use strict';

    angular
        .module('shipyard.layout')
        .controller('MenuController', MenuController);

    function MenuController($scope, $location, $cookieStore, authtoken) {
        $scope.template = 'app/layout/menu.html';
        $scope.isActive = function(path){
            if ($location.path().substr(0, path.length) == path) {
                return true
            }
            return false
        }
        $scope.isLoggedIn = authtoken.isLoggedIn();
    }
})()
