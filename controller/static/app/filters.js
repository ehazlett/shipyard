'use strict';

angular.module('shipyard.filters', [])
    .filter('truncate', function () {
        return function (t) {
            if (t.length < 12) {
                return t;
            }
            return t.substring(0, 12);
        };
    });
