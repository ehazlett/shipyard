
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
        .run(function($httpBackend, $filter) {

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
                         {"id":"c51f86c28340","name":"busybox","tag":"latest","description":"...","location":"Shipyard Registry","registry":"local","skipImageBuild":false},
                         {"id":"e8353be55900","name":"tomcat","tag":"6-jre7","description":"...","location":"Public Registry","registry":"","skipImageBuild":false},
                         {"id":"bf4d022972f1","name":"soninob/soninob","tag":"latest","description":"...","location":"Shipyard Registry","registry":"local","skipImageBuild":false}
                     ],
                     tests: [
                         {"id":"fghdfghfgh","name":"test1","description":"test1_description","targets":"busybox","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter1","paramValue":["ILM Data_2","ILM Data_4","ILM Data_5"]},{"paramName":"Parameter2","paramValue":["ILM Data_1","ILM Data_3"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"mnmjvbjjlj","name":"test2","description":"test2_description","targets":"","provider":{"type":"Predefined Provider","name":"provider_name1","test":"test1.1"},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter2","paramValue":["ILM Data_2","ILM Data_3"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"cvxfhznbgj","name":"test3","description":"test3_description","targets":"tomcat","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter1","paramValue":["ILM Data_1"]}],"tagging":{"onSuccess":"","onFailure":""}}
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
                         {"id":"sdghsertewrg","name":"soninob/soninob","tag":"latest","description":"...","location":"Shipyard Registry","registry":"local","skipImageBuild":false},
                         {"id":"asdgfagsfga","name":"rethinkdb","tag":"1","description":"...","location":"Public Registry","registry":"","skipImageBuild":false},
                         {"id":"sagfegfrefg","name":"java","tag":"7","description":"...","location":"Public Registry","registry":"","skipImageBuild":false}
                     ],
                     tests: [
                         {"id":"fsadfsdfer","name":"test1.1","description":"test1_description","targets":"verigreen","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter3","paramValue":["ILM Data_1","ILM Data_3"]},{"paramName":"Parameter1","paramValue":["ILM Data_2"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"ytueytueuy","name":"test1.2","description":"test2_description","targets":"","provider":{"type":"Predefined Provider","name":"provider_name2","test":"test1.2"},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter2","paramValue":["ILM Data_2"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"dfgtrsfgrt","name":"test1.3","description":"test3_description","targets":"","provider":{"type":"Predefined Provider","name":"provider_name2","test":"test2.2"},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter1","paramValue":["ILM Data_1"]}],"tagging":{"onSuccess":"","onFailure":""}}
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
                         {"id":"asdfawfgreg","name":"mongo","tag":"latest","description":"...","location":"Public Registry","registry":"","skipImageBuild":false},
                         {"id":"asdgfag66sfga","name":"verigreen/vg-collector","tag":"latest","description":"...","location":"Public Registry","registry":"","skipImageBuild":false},
                         {"id":"567j67w45yg4w","name":"shipyard/shipyard","tag":"2.0.0","description":"...","location":"Public Registry","registry":"","skipImageBuild":false}
                     ],
                     tests: [
                         {"id":"rtsrtsrret","name":"test2.1","description":"test1_description","targets":"","provider":{"type":"Predefined Provider","name":"provider_name1","test":"test1.2"},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter2","paramValue":["ILM Data_2"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"ertehgfhsg","name":"test2.2","description":"test2_description","targets":"verigreen","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter1","paramValue":["ILM Data_1"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"hkfgohkfog","name":"test2.3","description":"test3_description","targets":"mongodb","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter3","paramValue":["ILM Data_3"]}],"tagging":{"onSuccess":"","onFailure":""}}
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
                         {"id":"4y56ujty6h6ew","name":"busybox","tag":"latest","description":"...","location":"Public Registry","registry":"","skipImageBuild":false},
                         {"id":"tyujk67rj7j65","name":"ubuntu","tag":"latest","description":"...","location":"Public Registry","registry":"","skipImageBuild":false},
                         {"id":"8i5tryw456w","name":"mongo","tag":"latest","description":"...","location":"Public Registry","registry":"","skipImageBuild":false}
                     ],
                     tests: [
                         {"id":"gfhfjgfjyt","name":"test3.1","description":"test1_description","targets":"","provider":{"type":"Predefined Provider","name":"provider_name2","test":"test2.2"},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter3","paramValue":["ILM Data_3"]},{"paramName":"Parameter1","paramValue":["ILM Data_2"]},{"paramName":"Parameter2","paramValue":["ILM Data_1"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"yjdhkjpkoh","name":"test3.2","description":"test2_description","targets":"","provider":{"type":"Predefined Provider","name":"provider_name1","test":"test1.1"},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter2","paramValue":["ILM Data_2"]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"ytjtjhjghg","name":"test3.3","description":"test3_description","targets":"ubuntu","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"Parameter1","paramValue":["ILM Data_1"]},{"paramName":"Parameter2","paramValue":["ILM Data_1"]}],"tagging":{"onSuccess":"","onFailure":""}}
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
                         {"id":"4y56ujty6h6ew","name":"soninob/soninob","tag":"latest","description":"...","location":"Shipyard Registry","registry":"local","skipImageBuild":false},
                         {"id":"tyujk67rj7j65","name":"rethinkdb","tag":"latest","description":"...","location":"Public Registry","registry":"","skipImageBuild":false},
                         {"id":"8i5tryw456w","name":"busybox","tag":"latest","description":"...","location":"Public Registry","registry":"","skipImageBuild":false}
                     ],
                     tests: [
                         {"id":"jkghuyukuy","name":"test4.1","description":"test1_description","targets":"rethinkdb","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"","paramValue":[]},{"paramName":"","paramValue":[]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"uyiyuyukku","name":"test4.2","description":"test2_description","targets":"","provider":{"type":"Predefined Provider","name":"provider_name1","test":"test1.1"},"fromTag":"","blocker":"","parameters":[{"paramName":"","paramValue":[]}],"tagging":{"onSuccess":"","onFailure":""}},
                         {"id":"tyrtyrthjy","name":"test4.3","description":"test3_description","targets":"soninob/soninob","provider":{"type":"Clair [Internal]","name":"","test":""},"fromTag":"","blocker":"","parameters":[{"paramName":"","paramValue":[]}],"tagging":{"onSuccess":"","onFailure":""}}
                     ],
                     needsBuild: true,
                     lastRun: "Wednesday, February 24, 2016 at 00:00:00",
                     creationTime: "Wednesday, February 24, 2016 at 00:00:00",
                     updateTime: "Wednesday, February 24, 2016 at 00:00:00",
                     author: "admin",
                     updatedBy: "admin"
                 }
             ];

             var shipyard_registry = [
                 {id:"4y56ujty6h6ew",name:"trapsin",tag:"latest",description:"..."},
                 {id:"tyujk67rj7j65",name:"hammerdin",tag:"",description:"..."},
                 {id:"8i5tryw456w",name:"lightsorc",tag:"",description:"..."},
                 {id:"4y56ujty6h6ew",name:"assasin",tag:"latest",description:"..."},
                 {id:"tyujk67rj7j65",name:"hammerdin",tag:"",description:"..."},
                 {id:"8i5tryw456w",name:"paladin",tag:"",description:"..."}
             ];

             var providers = [
                 {
                     id:"34234234",
                     name:"provider_name1",
                     availableBuildTypes:"",
                     config:"",
                     url:"",
                     providerJobs: [
                         {id:"6745674565",name:"test1.1"},
                         {id:"67fdgdf456",name:"test1.2"}
                     ]
                 },
                 {
                     id:"dfsdfsdf43",
                     name:"provider_name2",
                     availableBuildTypes:"",
                     config:"",
                     url:"",
                     providerJobs: [
                         {id:"45453fdsdf",name:"test2.1"},
                         {id:"hg7665nb65",name:"test2.2"}
                     ]
                 }
             ];

             var results = {
                 projectId: "",
                 description: "string",
                 buildId: "dbUuid",
                 runDate: "08:10:22 2016-02-26 AD",
                 endDate: "08:10:22 2016-02-26 AD",
                 createDate: "08:10:22 2016-02-26 AD",author: "Jonathan Rosado",
                 projectVersion: "v0.1",
                 lastTagApplied: "4.05",
                 lastUpdate: "08:10:22 2016-02-26 AD",
                 updater: "updater value",
                 imageResults: [
                     {imageId: 'jsurnrpofn', imageName: 'image name 1'},
                     {imageId: 'pqochfntio', imageName: 'image name 2'},
                     {imageId: 'polejamnvd', imageName: 'image name 3'},
                     {imageId: 'pqoeinchdf', imageName: 'image name 4'}
                 ],
                 testsResults: [
                     {testId: 'paodjmnrht',imageId: 'powejrnamr',blocker: true,testName: 'test 1',imageName:'image name 1',dockerImageId: '7ae9b01b9b50',
                         status: 'Success',date: '08:10:22 2016-02-26 AD',endDate: '08:10:22 2016-02-26 AD',appliedTag: ['tag1', 'tag2']},
                     {testId: 'hjfgernjtu',imageId: 'nandmgemrt',blocker: false,testName: 'test 2',imageName:'image name 2',dockerImageId: '13350b9ed27e',
                         status: '',date: '08:10:22 2016-02-26 AD',endDate: '08:10:22 2016-02-26 AD',appliedTag: ['tag3', 'tag4']},
                     {testId: 'ieurnsahgt',imageId: 'majndgpfre',blocker: true,testName: 'test 3',imageName:'image name 3',dockerImageId: '033290b56c88',
                         status: 'Failure',date: '08:10:22 2016-02-26 AD',endDate: '08:10:22 2016-02-26 AD',appliedTag: ['tag5', 'tag6']},
                     {testId: 'pwoeitnhmf',imageId: 'fjghthfgtq',blocker: false,testName: 'test 4',imageName:'image name 4',dockerImageId: '4745e5c6efe2',
                         status: 'Success',date: '08:10:22 2016-02-26 AD',endDate: '08:10:22 2016-02-26 AD',appliedTag: ['tag7', 'tag8']}
                 ]
            };

             $httpBackend.whenGET('/api/providers').respond(providers);

             $httpBackend.whenGET('/api/projects').respond(projects);

             $httpBackend.whenRoute('GET', '/api/projects/:id/results').respond(function(method, url, data, headers, params) {
                 results.projectId = params.id;
                 return [200, angular.toJson(results), {}];
             });

             $httpBackend.whenRoute('POST', '/api/projects/:id/tests').respond(function(method, url, data, headers, params) {
                 var test = angular.fromJson(data);
                 var indexToEdit = ids.indexOf(params.id);

                 if (indexToEdit === -1) {
                     return [404, {}, {}];
                 }

                 test.id = makeid();

                 projects[indexToEdit].tests.push(test);

                 return [201, angular.toJson(test), {}];
             });

            $httpBackend.whenRoute('GET', '/api/projects/:id/tests').respond(function(method, url, data, headers, params) {
                var test = angular.fromJson(data);
                var indexToEdit = ids.indexOf(params.id);

                if (indexToEdit === -1) {
                    return [500, {}, {}];
                }

                return [200, angular.toJson(projects[indexToEdit].tests), {}];
            });

             $httpBackend.whenRoute('GET', '/api/projects/:id/images').respond(function(method, url, data, headers, params) {
                 var test = angular.fromJson(data);
                 var indexToEdit = ids.indexOf(params.id);

                 if (indexToEdit === -1) {
                     return [500, {}, {}];
                 }

                 return [200, angular.toJson(projects[indexToEdit].images), {}];
             });

            $httpBackend.whenRoute('POST', '/api/projects/:id/images').respond(function(method, url, data, headers, params) {
                var image = angular.fromJson(data);
                var indexToEdit = ids.indexOf(params.id);

                if (indexToEdit === -1) {
                    return [404, {}, {}];
                }

                image.id = makeid();

                projects[indexToEdit].images.push(image);

                return [201, angular.toJson(image), {}];
             });


             $httpBackend.whenRoute('GET', '/api/projects/:id').respond(function(method, url, data, headers, params) {
                 console.log(params);
                 return [200, angular.toJson(projects[ids.indexOf(params.id)]), {}];
             });

             $httpBackend.whenPOST('/api/projects').respond(function(method, url, data){
                 var project = angular.fromJson(data);

                 // Generate ID
                 project.id = makeid();
                 // Get last ran
                 project.creationTime = "Wednesday, February 24, 2016 at 00:00:00";

                 ids.push(project.id);
                 projects.push(project);

                 return [200, project, {}];
             });

             $httpBackend.whenRoute('PUT', '/api/projects/:id').respond(function(method, url, data, headers, params) {
                 var project = angular.fromJson(data);
                 var indexToEdit = ids.indexOf(params.id);

                 if (indexToEdit === -1) {
                     return [404, {}, {}];
                 }

                 // Overwrite old project (this might not be how the api behaves)
                 //"dddd, mmmm dd, yyyy at hh:MM:ss"
                 var d = new Date();
                 project.updateTime = d.toUTCString();
                 project.updatedBy = "admin";
                 projects[indexToEdit] = project;

                 return [200, angular.toJson(projects[indexToEdit]), {}];
             });

             $httpBackend.whenRoute('DELETE', '/api/projects/:id').respond(function(method, url, data, headers, params) {
                 var indexToEdit = ids.indexOf(params.id);

                 if (indexToEdit === -1) {
                     return [405, {}, {}];
                 }

                 // Overwrite old project (this might not be how the api behaves)
                 projects.splice(indexToEdit, 1);

                 return [200, {}, {}];
             });

             $httpBackend.whenGET('/api/projects/location').respond(shipyard_registry);

             //Let all the endpoints that don't have "projects" go through (i.e. make real http request)
             $httpBackend.whenGET(/.*/).passThrough();
             $httpBackend.whenPOST(/.*/).passThrough();
             $httpBackend.whenDELETE(/.*/).passThrough();
             $httpBackend.whenPUT(/.*/).passThrough();
             $httpBackend.whenPATCH(/.*/).passThrough();
             $httpBackend.whenDELETE(/.*/).passThrough();
             $httpBackend.whenJSONP(/.*/).passThrough();
             $httpBackend.whenRoute(/.*/).passThrough();
        })
})();
