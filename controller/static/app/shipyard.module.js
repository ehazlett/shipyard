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
            var ids = ["54b6354t65rtv54t", "4h565e4tw45bw45b", "dsfsdvfasdfdsfsd", "asverea4vawrwveb", "12345436b4w54w67"];
            var projects = [
                {
                    id: ids[0],
                    name: "SecurityProjectZ",
                    description: "Security project level A",
                    status: "Published",
                    image_list: {
                        "busybox:latest": "c51f86c28340",
                        "tomcat:7.0.65-jre7": "e8353be55900",
                        "soninob/soninob:v2": "bf4d022972f1"
                    },
                    is_build_needed: false,
                    last_run: "1456152831"
                },
                {
                    id: ids[1],
                    name: "SecurityProjectB",
                    description: "Security project level A",
                    status: "Published",
                    image_list: {
                        "jonbox:latest": "sdghsertewrg",
                        "tomdog:7.0.65-jre7": "asdgfagsfga",
                        "java:v2": "sagfegfrefg"
                    },
                    is_build_needed: false,
                    last_run: "1456152231"
                },
                {
                    id: ids[2],
                    name: "SecurityProjectC",
                    description: "Security project level A",
                    status: "Published",
                    image_list: {
                        "template:latest": "asdfawfgreg",
                        "winston:1.2": "asdgfag66sfga",
                        "oprah:v2": "567j67w45yg4w"
                    },
                    is_build_needed: false,
                    last_run: "1456152431"
                },
                {
                    id: ids[3],
                    name: "SecurityProjectA",
                    description: "Security project level A",
                    status: "Published",
                    image_list: {
                        "assasin:latest": "4y56ujty6h6ew",
                        "druid": "tyujk67rj7j65",
                        "paladin": "8i5tryw456w"
                    },
                    is_build_needed: false,
                    last_run: "1456152931"
                },
                {
                    id: ids[4],
                    name: "SecurityProjectD",
                    description: "Security project level A",
                    status: "Published",
                    image_list: {
                        "trapsin:latest": "4y56ujty6h6ew",
                        "hammerdin": "tyujk67rj7j65",
                        "lightsorc": "8i5tryw456w"
                    },
                    is_build_needed: false,
                    last_run: "1456152731"
                }
            ];

            $httpBackend.whenGET('/api/projects').respond(projects);

            $httpBackend.whenGET('/api/projects/' + ids[0]).respond(function(method, url, data) {
                return [200, angular.toJson(projects[0]), {}];
            });
            $httpBackend.whenGET('/api/projects/' + ids[1]).respond(function(method, url, data) {
                return [200, angular.toJson(projects[1]), {}];
            });
            $httpBackend.whenGET('/api/projects/' + ids[2]).respond(function(method, url, data) {
                return [200, angular.toJson(projects[2]), {}];
            });
            $httpBackend.whenGET('/api/projects/' + ids[3]).respond(function(method, url, data) {
                return [200, angular.toJson(projects[3]), {}];
            });
            $httpBackend.whenGET('/api/projects/' + ids[4]).respond(function(method, url, data) {
                return [200, angular.toJson(projects[4]), {}];
            });

            $httpBackend.whenPOST('/api/projects/').respond(function(method, url, data){
                var project = angular.fromJson(data);
                projects.push(project);
                return [200, project, {}];
            });

            //Let all the endpoints that don't have "projects" go through (i.e. make real http request)
            $httpBackend.whenGET(/((?!project).)*/).passThrough();
            $httpBackend.whenPOST(/((?!project).)*/).passThrough();
            $httpBackend.whenDELETE(/((?!project).)*/).passThrough();
            $httpBackend.whenPUT(/((?!project).)*/).passThrough();
            $httpBackend.whenPATCH(/((?!project).)*/).passThrough();
            $httpBackend.whenDELETE(/((?!project).)*/).passThrough();
            $httpBackend.whenJSONP(/((?!project).)*/).passThrough();
            $httpBackend.whenRoute(/((?!project).)*/).passThrough();
        })
})();
