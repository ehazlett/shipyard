(function(){
    'use strict';

    angular
        .module('shipyard.shared')
        .directive('accordion', accordion);

    function accordion() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).accordion(scope.$eval(attrs.accordion));
            }
        };
    }
})()
