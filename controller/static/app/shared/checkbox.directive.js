(function(){
    'use strict';

    angular
        .module('shipyard.shared')
        .directive('checkbox', checkbox);

    // this is from https://github.com/angularify/angular-semantic-ui/tree/master/src/checkbox
    function checkbox() {
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
    }

})()
