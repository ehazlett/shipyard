(function(){
    'use strict'; 

    angular
        .module('shipyard.shared')
        .directive('popup', function () {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    $(element).popup(scope.$eval(attrs.popup));
                }
            };
        });

})()

