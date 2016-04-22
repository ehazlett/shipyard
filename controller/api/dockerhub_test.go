package api

import (
	"fmt"
	"github.com/gorilla/context"
	apiClient "github.com/shipyard/shipyard/client"
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
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
		panic(fmt.Sprintf("Test init() for projects_test.go failed %s", err))
	}

	api = localApi
	globalMux = localMux

	cleanup()

	// Instantiate test server with Gorilla Mux Router enabled.
	// If you don't wrap the mux with the context.ClearHandler(),
	// then the server request cycle won't go through GorillaMux routing.
	ts = httptest.NewServer(context.ClearHandler(globalMux))

}

func TestDockerhubGetAuthToken(t *testing.T) {

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

func TestDockerhubSearchImages(t *testing.T) {
	Convey("Given that we have a valid token", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)

		Convey("When we make a request to retrieve images matching `docker` from dockerhub", func() {
			results, code, err := apiClient.DockerHubSearchImage(SY_AUTHTOKEN, ts.URL, "docker")
			Convey("Then the server should return OK", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusOK)
				Convey("Then the first image object should be `docker`", func() {
					So(results[0].Name, ShouldEqual, "docker")
				})
			})

		})
	})
}

func TestDockerhubSearchImageTags(t *testing.T) {
	Convey("Given that we have a valid token", t, func() {
		So(SY_AUTHTOKEN, ShouldNotBeNil)
		So(SY_AUTHTOKEN, ShouldNotBeEmpty)

		Convey("When we make a request to retrieve the tags of the image `docker`", func() {
			results, code, err := apiClient.DockerHubSearchImageTags(SY_AUTHTOKEN, ts.URL, "docker")
			Convey("Then the server should return OK", func() {
				So(err, ShouldBeNil)
				So(code, ShouldEqual, http.StatusOK)
				Convey("Then the first tag should be valid", func() {
					So(results[0].Name, ShouldNotBeNil)
					So(results[0].Name, ShouldNotBeEmpty)
					So(results[0].Layer, ShouldNotBeNil)
					So(results[0].Layer, ShouldNotBeEmpty)
				})
			})

		})
	})
}
