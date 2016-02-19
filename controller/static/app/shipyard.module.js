(function(){
    'use strict';

    angular
        .module('shipyard', [
                'shipyard.accounts',
                'shipyard.core',
                'shipyard.services',
                'shipyard.layout',
                'shipyard.help',
                'shipyard.login',
                'shipyard.containers',
                'shipyard.events',
                'shipyard.projects',
                'shipyard.registry',
                'shipyard.nodes',
                'shipyard.images',
                'shipyard.filters',
                'angular-jwt',
                'base64',
                'selectize',
                'ui.router',
                'ngMockE2E'
        ])

        //Configure HttpBackend to mock requests to ILM endpoints
        //Take a look at https://docs.angularjs.org/api/ngMockE2E/service/$httpBackend
        .run(function($httpBackend) {

        // TODO: Remove once the endpoint is implemented
        var projects = [
            {
                id: "1234567",
                name: "SecurityProjectA",
                description: "Security project level A",
                status: "Published",
                image_list: {
                    "busybox:latest": "c51f86c28340",
                    "tomcat:7.0.65-jre7": "e8353be55900",
                    "soninob/soninob:v2": "bf4d022972f1"
                },
                "Is_build_needed": "false"
            },
            {
                id: "2234567",
                name: "SecurityProjectA",
                description: "Security project level A",
                status: "Published",
                image_list: {
                    "busybox:latest": "c51f86c28340",
                    "tomcat:7.0.65-jre7": "e8353be55900",
                    "soninob/soninob:v2": "bf4d022972f1"
                },
                "Is_build_needed": "false"
            },
            {
                id: "3234567",
                name: "SecurityProjectA",
                description: "Security project level A",
                status: "Published",
                image_list: {
                    "busybox:latest": "c51f86c28340",
                    "tomcat:7.0.65-jre7": "e8353be55900",
                    "soninob/soninob:v2": "bf4d022972f1"
                },
                "Is_build_needed": "false"
            },
            {
                id: "4234567",
                name: "SecurityProjectA",
                description: "Security project level A",
                status: "Published",
                image_list: {
                    "busybox:latest": "c51f86c28340",
                    "tomcat:7.0.65-jre7": "e8353be55900",
                    "soninob/soninob:v2": "bf4d022972f1"
                },
                "Is_build_needed": "false"
            },
            {
                id: "5234567",
                name: "SecurityProjectA",
                description: "Security project level A",
                status: "Published",
                image_list: {
                    "busybox:latest": "c51f86c28340",
                    "tomcat:7.0.65-jre7": "e8353be55900",
                    "soninob/soninob:v2": "bf4d022972f1"
                },
                "Is_build_needed": "false"
            }
        ];

        $httpBackend.whenGET('/projects/json?all=1').respond(projects);

        //Let all the endpoints that don't have "projects" go through (i.e. make real http request)
        $httpBackend.whenGET(/((?!projects).)*/).passThrough();
            $httpBackend.whenPOST(/((?!projects).)*/).passThrough();
    })
})();
