(function() {
    'use strict';

    angular.module('shipyard', [
        'ngRoute',
        'ngCookies',
        'shipyard.layout',
        'shipyard.shared',
        'shipyard.dashboard',
        'shipyard.engines',
        'shipyard.containers',
        'shipyard.events',
        'shipyard.filters',
        'shipyard.services',
        'shipyard.controllers',
        'angular-flash.service',
        'angular-flash.flash-alert-directive',
        'angles',
        'ansiToHtml'
    ]);

    Chart.defaults.global.responsive = true;
    Chart.defaults.global.animation = false;
    Chart.defaults.global.showTooltips = true;

})();


