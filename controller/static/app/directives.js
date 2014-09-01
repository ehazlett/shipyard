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
    .directive('checkbox', function () {
        // this is from https://github.com/angularify/angular-semantic-ui/tree/master/src/checkbox
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope :{
                type: "@",
                size: "@",
                checked: "@",
                model: '=ngModel'
            },
            template: "<div class=\"{{checkbox_class}}\">" +
                        "<input type=\"checkbox\">"        +
                        "<label ng-click=\"click_on_checkbox()\" ng-transclude></label>" +
                        "</div>",
            link: function(scope, element, attrs, ngModel) {
                if (scope.type == 'standard' || scope.type == undefined){
                    scope.type = 'standard';
                    scope.checkbox_class = 'ui checkbox';
                } else if (scope.type == 'slider'){
                    scope.type = 'slider';
                    scope.checkbox_class = 'ui slider checkbox';
                } else if (scope.type == 'toggle'){
                    scope.type = 'toggle';
                    scope.checkbox_class = 'ui toggle checkbox';
                } else {
                    scope.type = 'standard';
                    scope.checkbox_class = 'ui checkbox';
                }
    
                if (scope.size == 'large'){
                    scope.checkbox_class = scope.checkbox_class + ' large';
                } else if (scope.size == 'huge') {
                    scope.checkbox_class = scope.checkbox_class + ' huge';
                }
    
                if (scope.checked == 'false' || scope.checked == undefined) {
                    scope.checked = false;
                } else {
                    scope.checked = true;
                    element.children()[0].setAttribute('checked', '');
                }
                element.bind('click', function () {
                    scope.$apply(function() {
                        if (scope.checked == true){
                            scope.checked = true;
                            scope.model   = false;
                            element.children()[0].removeAttribute('checked');
                        } else {
                            scope.checked = true;
                            scope.model   = true;
                            element.children()[0].setAttribute('checked', 'true');
                        }
                    })
                });
                scope.$watch('model', function(val){
                    if (val == undefined)
                        return;
                    if (val == true){
                        scope.checked = true;
                        element.children()[0].setAttribute('checked', 'true');
                    } else {
                        scope.checked = false;
                        element.children()[0].removeAttribute('checked');
                    }
                });
            }
        }
    })
    .directive('accordion', function () {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $(element).accordion(scope.$eval(attrs.accordion));
            }
        };
    });
