package api

import (
	"fmt"
	"github.com/gorilla/context"
	apiClient "github.com/shipyard/shipyard/client"
	"github.com/shipyard/shipyard/model"
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

const (
	//constants for testing
	TEST1_NAME       = "first test"
	TEST1_DESC       = "the first test"
	TEST1_TYPE       = "type 1"
	TEST1_PROVIDERID = "provider1"

	TEST1_NAME2       = "first test2"
	TEST1_DESC2       = "the first test2"
	TEST1_TYPE2       = "type 1 modified"
	TEST1_PROVIDERID2 = "provider1 modified"

	TEST2_NAME       = "second test"
	TEST2_DESC       = "the second test"
	TEST2_TYPE       = "type 2"
	TEST2_PROVIDERID = "provider2"
)

var (
	TEST1_SAVED_ID              string
	TEST2_SAVED_ID              string
	PROJECT_WITH_TESTS_SAVED_ID string
)

func init() {
	dockerEndpoint := os.Getenv("SHIPYARD_DOCKER_URI")

	// Default docker endpoint
	if dockerEndpoint == "" {
		dockerEndpoint = "tcp://127.0.0.1:2375"
	}

	rethinkDbEndpoint := os.Getenv("SHIPYARD_RETHINKDB_URI")

	// Default rethinkdb endpoint
	if rethinkDbEndpoint == "" {
		rethinkDbEndpoint = "rethinkdb:28015"
	}

	localApi, localMux, err := InitServer(&ShipyardServerConfig{
		RethinkdbAddr:          rethinkDbEndpoint,
		RethinkdbAuthKey:       "",
		RethinkdbDatabase:      "shipyard_test",
		DisableUsageInfo:       true,
		ListenAddr:             "",
		AuthWhitelist:          []string{},
		EnableCors:             true,
		LdapServer:             "",
		LdapPort:               389,
		LdapBaseDn:             "",
		LdapAutocreateUsers:    true,
		LdapDefaultAccessLevel: "containers:ro",
		DockerUrl:              dockerEndpoint,
		TlsCaCert:              "",
		TlsCert:                "",
		TlsKey:                 "",
		AllowInsecure:          true,
		ShipyardTlsCert:        "",
		ShipyardTlsKey:         "",
		ShipyardTlsCACert:      "",
	})

	if err != nil {
		panic(fmt.Sprintf("Test init() for tests_test.go failed %s", err))
	}

	api = localApi
	globalMux = localMux

	cleanupTests()

	// Instantiate test server with Gorilla Mux Router enabled.
	// If you don't wrap the mux with the context.ClearHandler(),
	// then the server request cycle won't go through GorillaMux routing.
	ts = httptest.NewServer(context.ClearHandler(globalMux))

}

func cleanupTests() error {
	if err := api.manager.DeleteAllTests(); err != nil {
		return err
	}

	if err := api.manager.DeleteAllProjects(); err != nil {
		return err
	}

	return nil
}

func TestTestsGetAuthToken(t *testing.T) {

	Convey("Given a valid set of credentials", t, func() {
		Convey("When we make a successful request for an auth token", func() {
			header, err := apiClient.GetAuthToken(ts.URL, SYUSER, SYPASS)
			So(err, ShouldBeNil)

			Convey("Then we get a valid authentication header\n", func() {
				SY_AUTHTOKEN = header
				So(header, ShouldNotBeEmpty)
				numberOfParts := 2
				authToken := strings.SplitN(header, ":", numberOfParts)
				So(len(authToken), ShouldEqual, numberOfParts)
				So(authToken[0], ShouldEqual, SYUSER)
			})
		})

	})
}

func TestCreateNewTest(t *testing.T) {
	Convey("Given that we have a valid token and we have a valid project created", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
		projectId, code, err := apiClient.CreateProject(SY_AUTHTOKEN, ts.URL, PROJECT1_NAME, PROJECT1_DESC, PROJECT1_STATUS, nil, nil, false)
		So(err, ShouldBeNil)
		So(code, ShouldEqual, http.StatusCreated)
		//So(projectId, ShouldNotBeEmpty)
		PROJECT_WITH_TESTS_SAVED_ID = projectId

		Convey("When we make a request to create a new test", func() {

			id, code, err := apiClient.CreateTest(SY_AUTHTOKEN, ts.URL, TEST1_NAME, TEST1_DESC, nil, TEST1_TYPE, "provider type", "provider name", "provider test", PROJECT_WITH_TESTS_SAVED_ID, []*model.Parameter{}, "success tag", "fail tag", "from tag")
			Convey("Then we get back a successful response", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusCreated)
				So(id, ShouldNotBeEmpty)
				TEST1_SAVED_ID = id
			})
		})
	})
}

//pull the test and make sure it is exactly as it was ordered to be created
func TestGetTest(t *testing.T) {
	Convey("Given that we have a valid Test and a valid token", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
		So(TEST1_SAVED_ID, ShouldNotBeEmpty)

		Convey("When we make a request to retrieve it using its id", func() {
			test, code, err := apiClient.GetTest(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID, TEST1_SAVED_ID)
			Convey("Then the server should return OK", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusOK)
				Convey("Then the test should have the expected values", func() {
					So(test.ID, ShouldEqual, TEST1_SAVED_ID)
					So(test.Description, ShouldEqual, TEST1_DESC)
					So(test.Name, ShouldEqual, TEST1_NAME)
					So(test.SelectedTestType, ShouldEqual, TEST1_TYPE)
					//So(test.ProviderId, ShouldEqual, TEST1_PROVIDERID)
					//So(test.ProjectId, ShouldEqual, PROJECT_WITH_TESTS_SAVED_ID)
				})
			})

		})
	})
}

func TestGetAllTests(t *testing.T) {
	Convey("Given that we have created an additional test", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
		id, code, err := apiClient.CreateTest(SY_AUTHTOKEN, ts.URL, TEST2_NAME, TEST2_DESC, nil, TEST2_TYPE, "provider type", "provider name", "provider test", PROJECT_WITH_TESTS_SAVED_ID, []*model.Parameter{}, "success tag", "fail tag", "from tag")
		TEST2_SAVED_ID = id
		So(err, ShouldBeNil)
		So(id, ShouldNotBeEmpty)
		So(code, ShouldEqual, http.StatusCreated)
		Convey("When we make a request to retrieve all tests", func() {
			tests, code, err := apiClient.GetTests(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID)
			Convey("Then the request should return some objects", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusOK)
				So(tests, ShouldNotBeNil)
				So(len(tests), ShouldEqual, 2)
				Convey("And the objects return should have the expected structure and expected values.", func() {
					descriptions := []string{}
					names := []string{}
					types := []string{}
					//providerIds := []string{}
					//PROJECT_WITH_TESTS_SAVED_IDs := []string{}
					ids := []string{}

					for _, test := range tests {
						descriptions = append(descriptions, test.Description)
						names = append(names, test.Name)
						types = append(types, test.SelectedTestType)
						//providerIds = append(providerIds, test.ProviderId)
						//PROJECT_WITH_TESTS_SAVED_IDs = append(PROJECT_WITH_TESTS_SAVED_IDs, test.ProjectId)
						ids = append(ids, test.ID)
						So(test.ID, ShouldNotBeNil)
						So(test.ID, ShouldNotBeEmpty)
						So(test.Name, ShouldNotBeEmpty)
						So(test.Description, ShouldNotBeEmpty)
						So(test.SelectedTestType, ShouldNotBeEmpty)
						//So(test.ProviderId, ShouldNotBeEmpty)
						//So(test.ProjectId, ShouldNotBeEmpty)
					}

					So(TEST1_DESC, ShouldBeIn, descriptions)
					So(TEST2_DESC, ShouldBeIn, descriptions)
					So(TEST1_SAVED_ID, ShouldBeIn, ids)
					So(TEST2_SAVED_ID, ShouldBeIn, ids)
					So(TEST1_NAME, ShouldBeIn, names)
					So(TEST2_NAME, ShouldBeIn, names)
					So(TEST1_TYPE, ShouldBeIn, types)
					So(TEST2_TYPE, ShouldBeIn, types)
					//So(TEST1_PROVIDERID, ShouldBeIn, providerIds)
					//So(TEST2_PROVIDERID, ShouldBeIn, providerIds)
					//So(PROJECT_WITH_TESTS_SAVED_ID, ShouldBeIn, PROJECT_WITH_TESTS_SAVED_IDs)
				})
			})

		})

	})
}

func TestUpdateTest(t *testing.T) {
	Convey("Given that we have a test created already.", t, func() {
		Convey("When we request to update that test.", func() {
			code, err := apiClient.UpdateTest(SY_AUTHTOKEN, ts.URL, TEST1_SAVED_ID, TEST1_NAME2, TEST1_DESC2, nil, TEST1_TYPE2, PROJECT_WITH_TESTS_SAVED_ID, "provider type", "provider name", "provider test", []*model.Parameter{}, "success tag", "fail tag", "from tag")
			Convey("Then we get an appropriate response back", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusNoContent)
				Convey("And when we retrieve the test again, it has the modified values.", func() {
					test, code, err := apiClient.GetTest(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID, TEST1_SAVED_ID)

					So(err, ShouldBeNil)
					So(code, ShouldEqual, http.StatusOK)
					So(test.ID, ShouldEqual, TEST1_SAVED_ID)
					So(test.Description, ShouldEqual, TEST1_DESC2)
					So(test.Name, ShouldEqual, TEST1_NAME2)
					So(test.SelectedTestType, ShouldEqual, TEST1_TYPE2)
					//So(test.ProviderId, ShouldEqual, TEST1_PROVIDERID2)
					//So(test.ProjectId, ShouldEqual, PROJECT_WITH_TESTS_SAVED_ID)
				})
			})
		})
	})
}

func TestDeleteTest(t *testing.T) {
	Convey("Given that we have a test created already.", t, func() {
		Convey("When we request to delete the test", func() {
			//delete the second test
			code, err := apiClient.DeleteTest(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID, TEST1_SAVED_ID)
			Convey("Then we get confirmation that it was deleted.", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusNoContent)
				Convey("And if we try to retrieve the test again by its id it should fail.", func() {
					//try to get the second test and make sure the server sends an error
					_, code, err = apiClient.GetTest(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID, TEST1_SAVED_ID)
					So(err, ShouldBeNil)
					So(code, ShouldEqual, http.StatusNotFound)
					Convey("And if we get all tests, it should not be in the collection.", func() {
						tests, code, err := apiClient.GetTests(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID)
						So(err, ShouldBeNil)
						So(code, ShouldEqual, http.StatusOK)
						So(tests, ShouldNotBeNil)
						So(len(tests), ShouldEqual, 1)

						descriptions := []string{}
						names := []string{}
						types := []string{}
						//providerIds := []string{}
						//PROJECT_WITH_TESTS_SAVED_IDs := []string{}
						ids := []string{}

						for _, test := range tests {
							descriptions = append(descriptions, test.Description)
							names = append(names, test.Name)
							types = append(types, test.SelectedTestType)
							//PROJECT_WITH_TESTS_SAVED_IDs = append(PROJECT_WITH_TESTS_SAVED_IDs, test.ProjectId)
							ids = append(ids, test.ID)
						}

						So(TEST1_SAVED_ID, ShouldNotBeIn, ids)
						So(TEST2_SAVED_ID, ShouldBeIn, ids)

					})
				})
			})
		})
	})
}

func TestTestNotFoundScenarios(t *testing.T) {
	Convey("Given that a test with a given id does not exist", t, func() {
		Convey("When we try to retrieve that test by its id", func() {
			test, code, err := apiClient.GetTest(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID, TEST1_SAVED_ID)
			Convey("Then we should get a not found error", func() {
				So(test, ShouldBeNil)
				So(code, ShouldEqual, http.StatusNotFound)
				So(err, ShouldBeNil)
			})
		})
		Convey("When we try to delete that test by its id", func() {
			code, err := apiClient.DeleteTest(SY_AUTHTOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID, TEST1_SAVED_ID)
			Convey("Then we should get a not found error", func() {
				So(code, ShouldEqual, http.StatusNotFound)
				So(err, ShouldBeNil)
			})
		})
	})
}

func TestUnauthorizedTestRequests(t *testing.T) {
	Convey("Given that we don't have a valid token", t, func() {
		Convey("When we try to get all tests", func() {
			tests, code, err := apiClient.GetTests(INVALID_AUTH_TOKEN, ts.URL, PROJECT_WITH_TESTS_SAVED_ID)
			Convey("Then we should be denied access", func() {
				So(code, ShouldEqual, http.StatusUnauthorized)
				So(err, ShouldNotBeNil)
				Convey("And we should not get anything in return", func() {
					So(tests, ShouldBeNil)
				})
			})
		})
	})
	Convey("Given that we have an empty token", t, func() {
		Convey("When we request to create a new Test", func() {
			id, code, err := apiClient.CreateTest("", ts.URL, TEST1_NAME, TEST1_DESC, nil, TEST1_TYPE, "provider type", "provider name", "provider test", PROJECT_WITH_TESTS_SAVED_ID, []*model.Parameter{}, "success tag", "fail tag", "from tag")

			Convey("Then we should be denied access", func() {
				So(err, ShouldNotBeNil)
				So(code, ShouldEqual, http.StatusUnauthorized)
				Convey("And we shoudl not get anything in return", func() {
					So(id, ShouldBeBlank)
				})
			})
		})
	})
}

// TODO: test all routes for tests

// This is a hack to ensure teardown / cleanup after this test suite ends.
func TestCleanupTests(t *testing.T) {
	// Cleanup all the state in the database
	Convey("Given that we have finished our Tests test suite", t, func() {
		Convey("Then we can cleanup", func() {
			err := cleanupTests()
			So(err, ShouldBeNil)
		})
	})
}
