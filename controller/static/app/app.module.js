(function() {
    'use strict';

    angular.module('shipyard', [
        'ngRoute',
        'ngCookies',
        'shipyard.filters',
        'shipyard.services',
        'shipyard.controllers',
        'shipyard.utils',
        'shipyard.directives',
        'angular-flash.service',
        'angular-flash.flash-alert-directive',
        'angles',
        'ansiToHtml'
    ]);

    Chart.defaults.global.responsive = true;
    Chart.defaults.global.animation = false;
    Chart.defaults.global.showTooltips = true;

})();


