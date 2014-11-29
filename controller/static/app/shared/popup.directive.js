(function(){
    'use strict';

    angular
        .module('shipyard.shared')
        .directive('popup', popup);

    function popup() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).popup(scope.$eval(attrs.popup));
            }
        };
    };

})()

