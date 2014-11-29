(function(){
    'use strict';

    angular
        .module('shipyard.shared')
        .directive('envvar', envvar);

    function envvar() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    $(element).parent().children('.hide').transition();
                    if ($(element).parent().children('.hide').hasClass('visible')) {
                        $(element).text('Show');
                    } else {
                        $(element).text('Hide');
                    }
                });
            }
        };
    };

})()

