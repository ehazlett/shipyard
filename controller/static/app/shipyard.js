(function() {
    'use strict';

    angular
        .module('shipyard')
        .run(
                ['$rootScope', '$state', '$stateParams', '$window', 'AuthService',
                function ($rootScope, $state, $stateParams, $window, AuthService) {
                    $rootScope.$state = $state;
                    $rootScope.$stateParams = $stateParams;

                    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
                        if (toState.authenticate && !AuthService.isLoggedIn()){
                            $state.transitionTo('login');
                            event.preventDefault(); 
                        }
                    });

                }
    ]
        )
})();
