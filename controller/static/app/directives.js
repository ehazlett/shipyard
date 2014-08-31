'use strict';

angular.module('shipyard.directives', [])
    .directive('popup', function () {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).popup(scope.$eval(attrs.popup));
            }
        };
    })
    .directive('dropdown', function () {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).dropdown(scope.$eval(attrs.dropdown));
            }
        };
    })
    .directive('envvar', function () {
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
    })
    .directive('accordion', function () {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).accordion(scope.$eval(attrs.accordion));
            }
        };
    });
