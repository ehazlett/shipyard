
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
            'ui.router'
        ])

        //Configure HttpBackend to mock requests to ILM endpoints
        //Take a look at https://docs.angularjs.org/api/ngMockE2E/service/$httpBackend
        .run(function($filter) {

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for( var i=0; i < 16; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                return text;
            }

            // TODO: Remove once the endpoint is implemented
            var ids = ["54b6354t65rtv54t", "4h565e4tw45bw45b", "dsfsdvfasdfdsfsd", "asverea4vawrwveb", "12345436b4w54w67"];
            var projects = [
                {
                    id: ids[0],
                    name: "SecurityProjectZ",
                    description: "Security project level A",
                    status: "Published",
                    images: [
                        {"id":"c51f86c28340","name":"busybox","tag":"latest","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"e8353be55900","name":"tomcat","tag":"7.0.65-jre7","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"bf4d022972f1","name":"soninob/soninob","tag":"v2","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""}
                    ],
                    needsBuild: false,
                    lastRun: "Wednesday, February 24, 2016 at 00:00:00",
                    creationTime: "Wednesday, February 24, 2016 at 00:00:00",
                    updateTime: "Wednesday, February 24, 2016 at 00:00:00",
                    author: "admin",
                    updatedBy: "admin"
                },
                {
                    id: ids[1],
                    name: "SecurityProjectB",
                    description: "Security project level A",
                    status: "Tested",
                    images: [
                        {"id":"sdghsertewrg","name":"jonbox","tag":"latest","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"asdgfagsfga","name":"tomdog","tag":"7.0.65-jre7","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"sagfegfrefg","name":"java","tag":"v2","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""}
                    ],
                    needsBuild: false,
                    lastRun: "Wednesday, February 24, 2016 at 00:00:00",
                    creationTime: "Wednesday, February 24, 2016 at 00:00:00",
                    updateTime: "Wednesday, February 24, 2016 at 00:00:00",
                    author: "admin",
                    updatedBy: "admin"
                },
                {
                    id: ids[2],
                    name: "SecurityProjectC",
                    description: "Security project level A",
                    status: "Published",
                    images: [
                        {"id":"asdfawfgreg","name":"template","tag":"latest","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"asdgfag66sfga","name":"winston","tag":"1.2","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"567j67w45yg4w","name":"oprah","tag":"v2","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""}
                    ],
                    needsBuild: false,
                    lastRun: "Wednesday, February 24, 2016 at 00:00:00",
                    creationTime: "Wednesday, February 24, 2016 at 00:00:00",
                    updateTime: "Wednesday, February 24, 2016 at 00:00:00",
                    author: "admin",
                    updatedBy: "admin"
                },
                {
                    id: ids[3],
                    name: "SecurityProjectA",
                    description: "Security project level A",
                    status: "Published",
                    images: [
                        {"id":"4y56ujty6h6ew","name":"assasin","tag":"latest","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"tyujk67rj7j65","name":"hammerdin","tag":"","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"8i5tryw456w","name":"paladin","tag":"","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""}
                    ],
                    needsBuild: false,
                    lastRun: "Wednesday, February 24, 2016 at 00:00:00",
                    creationTime: "Wednesday, February 24, 2016 at 00:00:00",
                    updateTime: "Wednesday, February 24, 2016 at 00:00:00",
                    author: "admin",
                    updatedBy: "admin"
                },
                {
                    id: ids[4],
                    name: "SecurityProjectD",
                    description: "Security project level A",
                    status: "Published",
                    images: [
                        {"id":"4y56ujty6h6ew","name":"trapsin","tag":"latest","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"tyujk67rj7j65","name":"hammerdin","tag":"","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""},
                        {"id":"8i5tryw456w","name":"lightsorc","tag":"","description":"...","location":"","skipImageBuild":false,"skipTLS":false,"url":"","username":"","password":""}
                    ],
                    needsBuild: true,
                    lastRun: "Wednesday, February 24, 2016 at 00:00:00",
                    creationTime: "Wednesday, February 24, 2016 at 00:00:00",
                    updateTime: "Wednesday, February 24, 2016 at 00:00:00",
                    author: "admin",
                    updatedBy: "admin"
                }
            ];
        })
})();
