  angular.module('myServiceModuleDI', []).
    factory('notify', function($window) {
      var msgs = [];
      return function(msg) {
        msgs.push(msg);
        if (msgs.length == 3) {
          $window.alert(msgs.join("\n"));
          msgs = [];
        }
      };
    }).
    controller('MyController', function($scope, notify) {
      $scope.callNotify = function(msg) {
        notify(msg);
      };
    });