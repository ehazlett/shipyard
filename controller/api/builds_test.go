package api

import (
	// "fmt"
	// "github.com/gorilla/context"
	// apiClient "github.com/shipyard/shipyard/client"
	"github.com/shipyard/shipyard/model"
	// . "github.com/smartystreets/goconvey/convey"
	"net/http"
	"net/http/httptest"
	// "os"
	// "strings"
	// "testing"
	"time"
)

const (
	SYUSER = "admin"
	SYPASS = "shipyard"
)

var (
	CURRENT_TIME  = time.Now().UTC()
	BUILD1_CONFIG = &model.BuildConfig{
		Name:        "Name",
		Description: "description",
		Targets: []*model.TargetArtifact{
			&model.TargetArtifact{
				ID:           "id",
				ArtifactType: "image",
			},
		},
		SelectedTestType: "selectedTestType",
		ProviderId:       "providerId",
	}
	BUILD2_CONFIG = &model.BuildConfig{
		Name:        "Name2",
		Description: "description2",
		Targets: []*model.TargetArtifact{
			&model.TargetArtifact{
				ID:           "id2",
				ArtifactType: "image2",
			},
		},
		SelectedTestType: "selectedTestType2",
		ProviderId:       "providerId2",
	}
	BUILD3_CONFIG = &model.BuildConfig{}
	BUILD1_STATUS = &model.BuildStatus{
		BuildId: "buildId",
		Status:  "new",
	}
	BUILD2_STATUS = &model.BuildStatus{
		BuildId: "buildId",
		Status:  "new"}
	BUILD3_STATUS  = &model.BuildStatus{}
	BUILD1_RESULTS = []*model.BuildResult{
		&model.BuildResult{
			BuildId: "buildId",
			TargetArtifact: &model.TargetArtifact{
				ID:           "id",
				ArtifactType: "image",
			},
			ResultEntries: []string{
				"result entry 1",
				"result entry 2",
			},
		},
	}
	BUILD2_RESULTS = []*model.BuildResult{
		&model.BuildResult{
			BuildId: "buildId2",
			TargetArtifact: &model.TargetArtifact{
				ID:           "id2",
				ArtifactType: "image2",
			},
			ResultEntries: []string{
				"result entry 3",
				"result entry 4",
			},
		},
	}
	TEST_ARTIFACTS = []*model.TargetArtifact{
		&model.TargetArtifact{
			ID:           "imageId1",
			ArtifactType: "image",
		},
	}
	PROJECT_IMAGES = []*model.Image{
		&model.Image{
			ID:   "imageId1",
			Name: "busybox",
			Tag:  "latest",
		},
	}
	BUILD3_RESULTS = []*model.BuildResult{}

	BUILD1_SAVED_ID string
	BUILD2_SAVED_ID string
	BUILD3_SAVED_ID string

	PROJECT_ID  string
	TEST_ID     string
	PROVIDER_ID string

	SY_AUTHTOKEN string //the authentication header to use with all requests
	api          *Api
	globalMux    *http.ServeMux
	ts           *httptest.Server
)

// func init() {
// 	dockerEndpoint := os.Getenv("SHIPYARD_DOCKER_URI")

// 	// Default docker endpoint
// 	if dockerEndpoint == "" {
// 		dockerEndpoint = "tcp://127.0.0.1:2375"
// 	}

// 	rethinkDbEndpoint := os.Getenv("SHIPYARD_RETHINKDB_URI")

// 	// Default rethinkdb endpoint
// 	if rethinkDbEndpoint == "" {
// 		rethinkDbEndpoint = "rethinkdb:28015"
// 	}

// 	localApi, localMux, err := InitServer(&ShipyardServerConfig{
// 		RethinkdbAddr:          rethinkDbEndpoint,
// 		RethinkdbAuthKey:       "",
// 		RethinkdbDatabase:      "shipyard_test",
// 		DisableUsageInfo:       true,
// 		ListenAddr:             "",
// 		AuthWhitelist:          []string{},
// 		EnableCors:             true,
// 		LdapServer:             "",
// 		LdapPort:               389,
// 		LdapBaseDn:             "",
// 		LdapAutocreateUsers:    true,
// 		LdapDefaultAccessLevel: "containers:ro",
// 		DockerUrl:              dockerEndpoint,
// 		TlsCaCert:              "",
// 		TlsCert:                "",
// 		TlsKey:                 "",
// 		AllowInsecure:          true,
// 		ShipyardTlsCert:        "",
// 		ShipyardTlsKey:         "",
// 		ShipyardTlsCACert:      "",
// 	})

// 	if err != nil {
// 		panic(fmt.Sprintf("Test init() for builds_test.go failed %s", err))
// 	}

// 	api = localApi
// 	globalMux = localMux

// 	cleanupBuilds()

// 	// Instantiate test server with Gorilla Mux Router enabled.
// 	// If you don't wrap the mux with the context.ClearHandler(),
// 	// then the server request cycle won't go through GorillaMux routing.
// 	ts = httptest.NewServer(context.ClearHandler(globalMux))

// }

// // TODO: this is not cleaning up the tokens
// func cleanupBuilds() error {

// 	if err := api.manager.DeleteAllBuilds(); err != nil {
// 		return err
// 	}

// 	return nil
// }

// func TestBuildsGetAuthToken(t *testing.T) {

// 	Convey("Given a valid set of credentials", t, func() {
// 		Convey("When we make a successful request for an auth token", func() {
// 			header, err := apiClient.GetAuthToken(ts.URL, SYUSER, SYPASS)
// 			So(err, ShouldBeNil)

// 			Convey("Then we get a valid authentication header\n", func() {
// 				SY_AUTHTOKEN = header
// 				So(header, ShouldNotBeEmpty)
// 				numberOfParts := 2
// 				authToken := strings.SplitN(header, ":", numberOfParts)
// 				So(len(authToken), ShouldEqual, numberOfParts)
// 				So(authToken[0], ShouldEqual, SYUSER)
// 			})
// 		})

// 	})
// }

// func TestCreateDependenciesForBuilds(t *testing.T) {

// 	Convey("Given that we have a valid token", t, func() {
// 		So(SY_AUTHTOKEN, ShouldNotBeNil)
// 		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
// 		Convey("When we make a request to create a new provider", func() {
// 			id, code, err := apiClient.CreateProvider(SY_AUTHTOKEN, ts.URL, PROVIDER1_NAME, PROVIDER1_JOB_TYPES, PROVIDER1_CONFIG, PROVIDER1_URL, PROVIDER1_JOBS)
// 			Convey("Then we get back a successful response", func() {
// 				So(err, ShouldBeNil)
// 				So(code, ShouldEqual, http.StatusCreated)
// 				So(id, ShouldNotBeEmpty)
// 				PROVIDER_ID = id
// 			})
// 		})
// 		Convey("When we make a request to create a new project", func() {
// 			id, code, err := apiClient.CreateProject(SY_AUTHTOKEN, ts.URL, PROJECT1_NAME, PROJECT1_DESC, PROJECT1_STATUS, PROJECT_IMAGES, nil, false)
// 			Convey("Then we get back a successful response", func() {
// 				So(id, ShouldNotBeEmpty)
// 				So(err, ShouldBeNil)
// 				So(code, ShouldEqual, http.StatusCreated)
// 				PROJECT_ID = id
// 			})
// 		})
// 		Convey("When we make a request to create a new test", func() {

// 			id, code, err := apiClient.CreateTest(SY_AUTHTOKEN, ts.URL, TEST1_NAME, TEST1_DESC, TEST_ARTIFACTS, TEST1_TYPE, "provider type", "provider name", "provider test", PROJECT_ID, []*model.Parameter{}, "success tag", "fail tag", "from tag")

// 			Convey("Then we get back a successful response", func() {
// 				So(err, ShouldBeNil)
// 				So(code, ShouldEqual, http.StatusCreated)
// 				So(id, ShouldNotBeEmpty)
// 				TEST_ID = id
// 			})
// 		})
// 	})

// }

// func TestCreateNewBuild(t *testing.T) {
// 	Convey("Given that we have a valid token", t, func() {
// 		So(SY_AUTHTOKEN, ShouldNotBeNil)
// 		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
// 		Convey("When we make a request to create a new build", func() {
// 			id, code, err := apiClient.CreateBuild(SY_AUTHTOKEN, ts.URL, BUILD1_CONFIG, BUILD1_STATUS, BUILD1_RESULTS, TEST_ID, PROJECT_ID, nil)
// 			Convey("Then we get back a successful response", func() {
// 				So(id, ShouldNotBeEmpty)
// 				So(code, ShouldEqual, http.StatusCreated)
// 				So(err, ShouldBeNil)

// 				BUILD1_SAVED_ID = id
// 			})
// 		})
// 	})
// }

// func TestGetBuild(t *testing.T) {
// 	Convey("Given that we have a valid build and a valid token", t, func() {
// 		So(SY_AUTHTOKEN, ShouldNotBeNil)
// 		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
// 		So(BUILD1_SAVED_ID, ShouldNotBeEmpty)

// 		Convey("When we make a request to retrieve it using its id", func() {
// 			build, code, err := apiClient.GetBuild(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID, BUILD1_SAVED_ID)
// 			Convey("Then the server should return OK", func() {
// 				So(code, ShouldNotBeNil)
// 				So(err, ShouldBeNil)
// 				Convey("Then the returned build should have the expected values", func() {
// 					So(build.ID, ShouldEqual, BUILD1_SAVED_ID)
// 					So(build.ProjectId, ShouldEqual, PROJECT_ID)
// 					So(build.TestId, ShouldEqual, TEST_ID)
// 					So(build.Status, ShouldResemble, BUILD1_STATUS)
// 					So(build.Config, ShouldResemble, BUILD1_CONFIG)
// 					So(build.Results, ShouldResemble, BUILD1_RESULTS)
// 				})
// 			})

// 		})
// 	})
// }

// func TestGetAllBuilds(t *testing.T) {
// 	Convey("Given that we have created an additional build", t, func() {
// 		So(SY_AUTHTOKEN, ShouldNotBeNil)
// 		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
// 		id, code, err := apiClient.CreateBuild(SY_AUTHTOKEN, ts.URL, BUILD2_CONFIG, BUILD2_STATUS, BUILD2_RESULTS, TEST_ID, PROJECT_ID, nil)

// 		BUILD2_SAVED_ID = id

// 		So(err, ShouldBeNil)
// 		So(id, ShouldNotBeEmpty)
// 		So(code, ShouldEqual, http.StatusCreated)
// 		Convey("When we make a request to retrieve all builds", func() {
// 			builds, err := apiClient.GetBuilds(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID)
// 			Convey("Then the request should return some objects", func() {
// 				So(err, ShouldBeNil)
// 				So(builds, ShouldNotBeNil)
// 				So(len(builds), ShouldEqual, 2)
// 				Convey("And the objects return should have the expected structure and expected values.", func() {

// 					found_build1 := false
// 					found_build2 := false

// 					for _, build := range builds {
// 						if build.ID == BUILD1_SAVED_ID {
// 							So(build.ProjectId, ShouldEqual, PROJECT_ID)
// 							So(build.TestId, ShouldEqual, TEST_ID)
// 							So(build.Status, ShouldResemble, BUILD1_STATUS)
// 							So(build.Config, ShouldResemble, BUILD1_CONFIG)
// 							So(build.Results, ShouldResemble, BUILD1_RESULTS)
// 							found_build1 = true
// 						}
// 						if build.ID == BUILD2_SAVED_ID {
// 							So(build.ProjectId, ShouldEqual, PROJECT_ID)
// 							So(build.TestId, ShouldEqual, TEST_ID)
// 							So(build.Status, ShouldResemble, BUILD2_STATUS)
// 							So(build.Config, ShouldResemble, BUILD2_CONFIG)
// 							So(build.Results, ShouldResemble, BUILD2_RESULTS)
// 							found_build2 = true
// 						}
// 					}
// 					So(found_build1, ShouldBeTrue)
// 					So(found_build2, ShouldBeTrue)

// 				})
// 			})

// 		})

// 	})
// }

// func TestUpdateBuild(t *testing.T) {
// 	Convey("Given that we have a build created already.", t, func() {
// 		Convey("When we request to update that build.", func() {
// 			err := apiClient.UpdateBuild(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID, BUILD2_SAVED_ID, BUILD2_CONFIG, BUILD2_STATUS, BUILD2_RESULTS, nil)

// 			Convey("Then we get an appropriate response back", func() {
// 				So(err, ShouldBeNil)
// 				Convey("And when we retrieve the build again, it has the modified values.", func() {
// 					build, _, err := apiClient.GetBuild(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID, BUILD2_SAVED_ID)
// 					So(err, ShouldBeNil)
// 					So(build.ID, ShouldEqual, BUILD2_SAVED_ID)
// 					So(build.ProjectId, ShouldEqual, PROJECT_ID)
// 					So(build.TestId, ShouldEqual, TEST_ID)
// 					So(build.Status.Status, ShouldEqual, "stopped")
// 					So(build.Config, ShouldResemble, BUILD2_CONFIG)
// 					So(build.Results, ShouldResemble, BUILD2_RESULTS)
// 				})
// 			})
// 		})
// 	})
// }

// func TestDeleteBuild(t *testing.T) {
// 	Convey("Given that we have a build created already.", t, func() {
// 		Convey("When we request to delete the build", func() {
// 			//delete the second build
// 			err := apiClient.DeleteBuild(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID, BUILD2_SAVED_ID)
// 			Convey("Then we get confirmation that it was deleted.", func() {
// 				So(err, ShouldBeNil)
// 				Convey("And if we try to retrieve the build again by its id it should fail.", func() {
// 					_, code, err := apiClient.GetBuild(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID, BUILD2_SAVED_ID)
// 					So(err, ShouldBeNil)
// 					So(code, ShouldEqual, http.StatusNotFound)
// 					Convey("And if we get all builds, it should not be in the collection.", func() {
// 						builds, err := apiClient.GetBuilds(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID)
// 						So(err, ShouldBeNil)
// 						So(builds, ShouldNotBeNil)
// 						So(len(builds), ShouldEqual, 1)

// 						for _, build := range builds {
// 							So(build.ID, ShouldNotEqual, BUILD2_SAVED_ID)
// 						}

// 					})
// 				})
// 			})
// 		})
// 	})
// }

// func TestBuildNotFoundScenarios(t *testing.T) {
// 	cleanupBuilds()
// 	Convey("Given that a build with a given id does not exist", t, func() {
// 		Convey("When we try to retrieve that build by its id", func() {
// 			build, code, err := apiClient.GetBuild(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID, BUILD2_SAVED_ID)
// 			Convey("Then we should get a not found error", func() {
// 				So(build, ShouldBeNil)
// 				So(code, ShouldEqual, http.StatusNotFound)
// 				So(err, ShouldBeNil)
// 			})
// 		})
// 		Convey("When we try to delete that build by its id", func() {
// 			err := apiClient.DeleteBuild(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID, BUILD2_SAVED_ID)
// 			Convey("Then we should get a not found error", func() {
// 				So(err, ShouldNotBeNil)
// 			})
// 		})
// 	})
// }

// func TestUnauthorizedBuildRequests(t *testing.T) {
// 	Convey("Given that we don't have a valid token", t, func() {
// 		Convey("When we try to get all builds", func() {
// 			providers, code, err := apiClient.GetProviders(INVALID_AUTH_TOKEN, ts.URL)
// 			Convey("Then we should be denied access", func() {
// 				So(code, ShouldEqual, http.StatusUnauthorized)
// 				So(err, ShouldNotBeNil)
// 				Convey("And we should not get anything in return", func() {
// 					So(providers, ShouldBeNil)
// 				})
// 			})
// 		})
// 	})
// 	Convey("Given that we have an empty token", t, func() {
// 		Convey("When we request to create a new provider", func() {
// 			builds, err := apiClient.GetBuilds("", ts.URL, PROJECT_ID, TEST_ID)
// 			Convey("Then we should be denied access", func() {
// 				So(err, ShouldNotBeNil)
// 				Convey("And we shoudl not get anything in return", func() {
// 					So(builds, ShouldBeNil)
// 				})
// 			})
// 		})
// 	})
// }

// // TODO: test all routes for providers and jobs
// func TestCleanupBuildDependenciesTests(t *testing.T) {
// 	Convey("When we request to delete the provider created for the build testing", t, func() {
// 		//delete the provider created for build testing
// 		code, err := apiClient.DeleteProvider(SY_AUTHTOKEN, ts.URL, PROVIDER_ID)
// 		Convey("Then we get confirmation that it was deleted.", func() {
// 			So(err, ShouldBeNil)
// 			So(code, ShouldEqual, http.StatusNoContent)
// 		})
// 	})

// 	Convey("When we request to delete the test created for the build testing", t, func() {
// 		//delete the test created for build testing
// 		code, err := apiClient.DeleteTest(SY_AUTHTOKEN, ts.URL, PROJECT_ID, TEST_ID)
// 		Convey("Then we get confirmation that it was deleted.", func() {
// 			So(err, ShouldBeNil)
// 			So(code, ShouldEqual, http.StatusNoContent)
// 		})
// 	})

// 	Convey("When we request to delete the project created for the build testing", t, func() {
// 		//delete the project created for build testing
// 		code, err := apiClient.DeleteProject(SY_AUTHTOKEN, ts.URL, PROJECT_ID)
// 		Convey("Then we get confirmation that it was deleted.", func() {
// 			So(err, ShouldBeNil)
// 			So(code, ShouldEqual, http.StatusNoContent)
// 		})
// 	})
// }

// // This is a hack to ensure teardown / cleanup after this test suite ends.
// func TestCleanupBuildTests(t *testing.T) {
// 	// Cleanup all the state in the database
// 	Convey("Given that we have finished our builds test suite", t, func() {
// 		Convey("Then we can cleanup", func() {
// 			err := cleanupBuilds()
// 			So(err, ShouldBeNil)
// 		})
// 	})
// }
