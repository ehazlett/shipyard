'use strict';

angular.module('shipyard.controllers', ['ngCookies'])
        .controller('LoginController', function($scope, $cookieStore, $window, flash, Login, authtoken) {
            $scope.template = 'templates/login.html';
            $scope.login = function() {
                Login.login({username: $scope.username, password: $scope.password}).$promise.then(function(data){
                    authtoken.save($scope.username, data.auth_token);
                    $window.location.href = '/#/dashboard';
                    $window.location.reload();
                }, function() {
                    flash.error = 'invalid username/password';
                });
            }
        })
        .controller('LogoutController', function($scope, $window, authtoken) {
            authtoken.delete();
            $window.location.href = '/#/login';
            $window.location.reload();
        })

$(function(){
    $('.message .close').on('click', function() {
          $(this).closest('.message').fadeOut();
    });
});
