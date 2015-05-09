(function() {
    'use strict';

    angular
        .module('shipyard.core')
        .directive('resetField', function($compile) {
            return {
                require: 'ngModel',
                scope: {
                },
                link: function(scope, element, attrs, ctrl) {
                    var template = $compile('<i class="delete icon"></i>')(scope);
                    element.after(template);

                    element.parent().find('i').bind('click', function(e) {
                        ctrl.$setViewValue("");
                        ctrl.$render();
                        setTimeout(function() {
                            element[0].focus();
                        }, 0, false);
                        scope.$apply();
                    });
                }
            }
        })
        .directive('jquery', function() {
            return function(scope, element, attrs) {
                if (scope.$last) setTimeout(function(){
                    scope.$emit('ngRepeatFinished', element, attrs);
                }, 0);
            }
        });

})();
