package api

import (
	"fmt"
	"github.com/gorilla/context"
	apiClient "github.com/shipyard/shipyard/client"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/shipyard/shipyard/model"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

const (
	PROJECT_ID = "projectId"
	TEST_ID    = "testId"
)

var (
	BUILD1_CONFIG = &model.BuildConfig{
		Name:        "Name",
		Description: "description",
		Targets: []*model.TargetArtifact{
			&model.TargetArtifact{
				ArtifactId:   "",
				ArtifactType: "image",
			},
		},
		SelectedTestType: "selectedTestType",
		ProviderId:       "",
	}
	BUILD2_CONFIG = &model.BuildConfig{}
	BUILD3_CONFIG = &model.BuildConfig{}
	BUILD1_STATUS = &model.BuildStatus{
		BuildId: "",
		Status:  "",
	}
	BUILD2_STATUS  = &model.BuildStatus{}
	BUILD3_STATUS  = &model.BuildStatus{}
	BUILD1_RESULTS = []*model.BuildResult{
		&model.BuildResult{
			BuildId: "",
			TargetArtifact: &model.TargetArtifact{
				ArtifactId:   "",
				ArtifactType: "image",
			},
			ResultEntries: &map[string]string{
				"key1": "result1",
			},
			TimeStamp: time.Now(),
		},
	}
	BUILD2_RESULTS = []*model.BuildResult{}
	BUILD3_RESULTS = []*model.BuildResult{}

	BUILD1_SAVED_ID string
	BUILD2_SAVED_ID string
	BUILD3_SAVED_ID string
	ts5000          *httptest.Server
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
		panic(fmt.Sprintf("Test init() for builds_test.go failed %s", err))
	}

	api = localApi
	globalMux = localMux

	cleanupBuilds()

	// Instantiate test server with Gorilla Mux Router enabled.
	// If you don't wrap the mux with the context.ClearHandler(),
	// then the server request cycle won't go through GorillaMux routing.
	ts5000 = httptest.NewServer(context.ClearHandler(globalMux))

}

// TODO: this is not cleaning up the tokens
func cleanupBuilds() error {

	if err := api.manager.DeleteAllBuilds(); err != nil {
		return err
	}

	return nil
}

func TestBuildsGetAuthToken(t *testing.T) {

	Convey("Given a valid set of credentials", t, func() {
		Convey("When we make a successful request for an auth token", func() {
			header, err := apiClient.GetAuthToken(ts5000.URL, SYUSER, SYPASS)
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

func TestCreateNewBuild(t *testing.T) {
	Convey("Given that we have a valid token", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
		Convey("When we make a request to create a new build", func() {
			id, code, err := apiClient.CreateBuild(SY_AUTHTOKEN, ts5000.URL, PROJECT_ID, TEST_ID, BUILD1_CONFIG, BUILD1_STATUS, BUILD1_RESULTS)
			Convey("Then we get back a successful response", func() {

				So(id, ShouldNotBeEmpty)
				So(code, ShouldEqual, http.StatusCreated)
				So(err, ShouldBeNil)

				BUILD1_SAVED_ID = id
			})
		})
	})
}

/*
//pull the provider and make sure it is exactly as it was ordered to be created
func TestGetProvider(t *testing.T) {
	Convey("Given that we have a valid provider and a valid token", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
		So(PROVIDER1_SAVED_ID, ShouldNotBeEmpty)

		Convey("When we make a request to retrieve it using its id", func() {
			provider, code, err := apiClient.GetProvider(SY_AUTHTOKEN, ts.URL, PROVIDER1_SAVED_ID)
			Convey("Then the server should return OK", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusOK)
				Convey("Then the returned provider should have the expected values", func() {
					So(provider.ID, ShouldEqual, PROVIDER1_SAVED_ID)
					So(provider.Name, ShouldEqual, PROVIDER1_NAME)
					So(provider.Url, ShouldEqual, PROVIDER1_URL)
				})
			})

		})
	})
}

func TestGetAllProviders(t *testing.T) {
	Convey("Given that we have created an additional provider", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)
		id, code, err := apiClient.CreateProvider(SY_AUTHTOKEN, ts.URL, PROVIDER2_NAME, PROVIDER2_JOB_TYPES, PROVIDER2_CONFIG, PROVIDER2_URL, PROVIDER2_JOBS)

		PROVIDER2_SAVED_ID = id

		So(err, ShouldBeNil)
		So(id, ShouldNotBeEmpty)
		So(code, ShouldEqual, http.StatusCreated)
		Convey("When we make a request to retrieve all providers", func() {
			providers, code, err := apiClient.GetProviders(SY_AUTHTOKEN, ts.URL)
			Convey("Then the request should return some objects", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusOK)
				So(providers, ShouldNotBeNil)
				So(len(providers), ShouldEqual, 2)
				Convey("And the objects return should have the expected structure and expected values.", func() {
					names := []string{}
					urls := []string{}

					for _, provider := range providers {
						names = append(names, provider.Name)
						urls = append(urls, provider.Url)
						So(provider.ID, ShouldNotBeNil)
						So(provider.ID, ShouldNotBeEmpty)
					}

					So(PROVIDER1_NAME, ShouldBeIn, names)
					So(PROVIDER2_NAME, ShouldBeIn, names)
					So(PROVIDER1_URL, ShouldBeIn, urls)
					So(PROVIDER2_URL, ShouldBeIn, urls)

				})
			})

		})

	})
}

func TestUpdateProvider(t *testing.T) {
	Convey("Given that we have a provider created already.", t, func() {
		Convey("When we request to update that provider.", func() {
			code, err := apiClient.UpdateProvider(SY_AUTHTOKEN, ts.URL, PROVIDER1_NAME2, PROVIDER1_SAVED_ID, PROVIDER1_JOB_TYPES2, PROVIDER1_CONFIG2, PROVIDER1_URL2, PROVIDER1_JOBS2)
			Convey("Then we get an appropriate response back", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusNoContent)
				Convey("And when we retrieve the provider again, it has the modified values.", func() {
					provider, code, err := apiClient.GetProvider(SY_AUTHTOKEN, ts.URL, PROVIDER1_SAVED_ID)
					So(err, ShouldBeNil)
					So(code, ShouldEqual, http.StatusOK)
					So(provider.Name, ShouldEqual, PROVIDER1_NAME2)
					So(provider.Url, ShouldEqual, PROVIDER1_URL2)
				})
			})
		})
	})
}

func TestDeleteProvider(t *testing.T) {
	Convey("Given that we have a provider created already.", t, func() {
		Convey("When we request to delete the provider", func() {
			//delete the second provider
			code, err := apiClient.DeleteProvider(SY_AUTHTOKEN, ts.URL, PROVIDER2_SAVED_ID)
			Convey("Then we get confirmation that it was deleted.", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusNoContent)
				Convey("And if we try to retrieve the provider again by its id it should fail.", func() {
					_, code, err = apiClient.GetProvider(SY_AUTHTOKEN, ts.URL, PROVIDER2_SAVED_ID)
					So(err, ShouldBeNil)
					So(code, ShouldEqual, http.StatusNotFound)
					Convey("And if we get all providers, it should not be in the collection.", func() {
						providers, code, err := apiClient.GetProviders(SY_AUTHTOKEN, ts.URL)
						So(err, ShouldBeNil)
						So(code, ShouldEqual, http.StatusOK)
						So(providers, ShouldNotBeNil)
						So(len(providers), ShouldEqual, 1)
						names := []string{}
						urls := []string{}
						ids := []string{}

						for _, provider := range providers {
							names = append(names, provider.Name)
							urls = append(urls, provider.Url)
							ids = append(ids, provider.ID)
							So(provider.ID, ShouldNotBeNil)
							So(provider.ID, ShouldNotBeEmpty)
						}

						So(PROVIDER2_SAVED_ID, ShouldNotBeIn, ids)

					})
				})
			})
		})
	})

}

func TestProviderNotFoundScenarios(t *testing.T) {
	cleanupProviders()
	Convey("Given that a provider with a given id does not exist", t, func() {
		Convey("When we try to retrieve that provider by its id", func() {
			provider, code, err := apiClient.GetProvider(SY_AUTHTOKEN, ts.URL, PROVIDER1_SAVED_ID)
			Convey("Then we should get a not found error", func() {
				So(provider, ShouldBeNil)
				So(code, ShouldEqual, http.StatusNotFound)
				So(err, ShouldBeNil)
			})
		})
		Convey("When we try to delete that provider by its id", func() {
			code, err := apiClient.DeleteProvider(SY_AUTHTOKEN, ts.URL, PROVIDER1_SAVED_ID)
			Convey("Then we should get a not found error", func() {
				So(code, ShouldEqual, http.StatusNotFound)
				So(err, ShouldBeNil)
			})
		})
	})
}

func TestUnauthorizedProviderRequests(t *testing.T) {
	Convey("Given that we don't have a valid token", t, func() {
		Convey("When we try to get all providers", func() {
			providers, code, err := apiClient.GetProviders(INVALID_AUTH_TOKEN, ts.URL)
			Convey("Then we should be denied access", func() {
				So(code, ShouldEqual, http.StatusUnauthorized)
				So(err, ShouldNotBeNil)
				Convey("And we should not get anything in return", func() {
					So(providers, ShouldBeNil)
				})
			})
		})
	})
	Convey("Given that we have an empty token", t, func() {
		Convey("When we request to create a new provider", func() {
			id, code, err := apiClient.CreateProvider("", ts.URL, PROVIDER1_NAME2, PROVIDER1_JOB_TYPES2, PROVIDER1_CONFIG2, PROVIDER1_URL2, PROVIDER1_JOBS2)
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

func TestAddProviderJob(t *testing.T) {
	Convey("Given that we create a new provider", t, func() {
		providerId, code, err := apiClient.CreateProvider(SY_AUTHTOKEN, ts.URL, PROVIDER3_NAME, PROVIDER3_JOB_TYPES, PROVIDER3_CONFIG, PROVIDER3_URL, PROVIDER3_JOBS)

		So(err, ShouldBeNil)
		So(code, ShouldEqual, http.StatusCreated)
		So(providerId, ShouldNotBeEmpty)

		Convey("When we add a new job to it", func() {
			code, err := apiClient.AddProviderJob(SY_AUTHTOKEN, ts.URL, providerId, PROVIDER3_JOB1)
			Convey("Then we should get a successful response", func() {
				So(code, ShouldEqual, http.StatusCreated)
				So(err, ShouldBeNil)
				Convey("And the provider should now have a job embedded in its structure", func() {
					provider, code, err := apiClient.GetProvider(SY_AUTHTOKEN, ts.URL, providerId)
					So(err, ShouldBeNil)
					So(provider, ShouldNotBeNil)
					So(code, ShouldEqual, http.StatusOK)
					jobNames := []string{}

					So(len(provider.ProviderJobs), ShouldEqual, 3)
					for _, job := range provider.ProviderJobs {
						So(job, ShouldNotBeNil)
						if job != nil {
							jobNames = append(jobNames, job.Name)
						}
					}
					for _, job := range PROVIDER3_JOBS {
						So(job.Name, ShouldBeIn, jobNames)
					}

					So(PROVIDER3_JOB1.Name, ShouldBeIn, jobNames)

					PROVIDER3_SAVED_ID = providerId
				})
			})
		})
	})
}

func TestGetProviderJobs(t *testing.T) {
	Convey("Given that we have added jobs to a provider in the previous step", t, func() {
		So(PROVIDER3_SAVED_ID, ShouldNotBeEmpty)
		Convey("When we request all jobs for a particular provider", func() {
			jobs, code, err := apiClient.GetProviderJobs(SY_AUTHTOKEN, ts.URL, PROVIDER3_SAVED_ID)
			Convey("Then we get a correct response back", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusOK)
			})
			Convey("Then we get all the jobs back", func() {
				jobNames := []string{}
				So(len(jobs), ShouldEqual, 3)
				for _, job := range jobs {
					So(job, ShouldNotBeNil)
					if job != nil {
						jobNames = append(jobNames, job.Name)
					}
				}
				for _, job := range PROVIDER3_JOBS {
					So(job.Name, ShouldBeIn, jobNames)
				}

				So(PROVIDER3_JOB1.Name, ShouldBeIn, jobNames)
			})
		})
	})
}
*/
// TODO: test all routes for providers and jobs

// This is a hack to ensure teardown / cleanup after this test suite ends.
func TestCleanupBuildTests(t *testing.T) {
	// Cleanup all the state in the database
	Convey("Given that we have finished our provider test suite", t, func() {
		Convey("Then we can cleanup", func() {
			err := cleanupBuilds()
			So(err, ShouldBeNil)
		})
	})
}
