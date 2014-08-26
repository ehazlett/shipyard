'use strict';

angular.module('shipyard.filters', [])
    .filter('truncate', function () {
        return function (t) {
            if (t.length < 12) {
                return t;
            }
            return t.substring(0, 12);
        };
    })
    .filter('eventCssClass', function () {
        return function (t) {
            var cls = "";
            switch(t) {
                case 'die':
                    cls = "off red";
                    break;
                case 'start':
                    cls = "checkmark green";
                    break;
                case 'create':
                    cls = "add blue";
                    break;
                case 'restart':
                    cls = "refresh blue";
                    break;
            }
            return cls;
        };
    });
