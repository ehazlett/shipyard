(function() {
    'use strict';

    angular
        .module('shipyard')
        .run(
                ['$rootScope', '$state', '$stateParams', '$window', 'AuthService',
                function ($rootScope, $state, $stateParams, $window, AuthService) {
                    $rootScope.$state = $state;
                    $rootScope.$stateParams = $stateParams;

                    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
                        $rootScope.username = AuthService.getUsername();
                    });

                    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams) {
                        event.preventDefault(); 
                        console.log("$stateChangeError", event, toState, toParams, fromState, fromParams);
                        $state.transitionTo('error');
                    });

                    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
                    });
                }
    ]
        )
})();
