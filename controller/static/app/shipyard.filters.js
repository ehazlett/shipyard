(function() {
    'use strict';

    angular
        .module('shipyard.filters', [])
        .filter('roleDisplay', function() {
            return function(input) {
                var display = "";
                var scope = "";
                var parts = input.split(':');
                switch (parts[1]) {
                    case "ro":
                        scope = "Read Only";
                        break;
                    default:
                        scope = "";
                        break;
                }
                return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + " " + scope;
            }
        })
})();
