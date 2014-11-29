(function(){
    'use strict';

    angular
        .module('shipyard.shared')
        .directive('dropdown', dropdown);

    function dropdown() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).dropdown(scope.$eval(attrs.dropdown));
            }
        };
    };

})()

