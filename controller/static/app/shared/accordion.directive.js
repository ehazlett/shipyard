(function(){
    'use strict'; 

    angular
        .module('shipyard.shared')
        .directive('accordion', function () {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    $(element).accordion(scope.$eval(attrs.accordion));
                }
            };
        });

})()
