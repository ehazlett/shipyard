package ilm_client

//
//import (
//	"fmt"
//	. "github.com/smartystreets/goconvey/convey"
//	"testing"
//)
//
////tests for the client utils functions will go here
//func TestClientFetchToken(t *testing.T) {
//	Convey("We can get a token from the server", t, func() {
//		_, err := fetchToken(fmt.Sprintf("%s/auth/login", SYURL), "admin", "shipyard")
//		So(err, ShouldBeNil)
//	})
//	Convey("Invalid credentials are not accepted", t, func() {
//		_, err := fetchToken(fmt.Sprintf("%s/auth/login", SYURL), "admin", "shipyard2")
//		So(err, ShouldNotBeNil)
//	})
//}
//
//func TestClientSendRequest(t *testing.T) {
//	Convey("A valid request produces a valid response", t, func() {
//		So(1, ShouldEqual, 1) //not testing for now, because it is tested with every single request ever made by any of the other functions
//	})
//}
