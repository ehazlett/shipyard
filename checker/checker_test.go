package checker

import (
	"fmt"
	"testing"
)

func TestImage(t *testing.T) {

	message, err := CheckImage("", "marvambass/nginx-registry-proxy")
	fmt.Printf("checker message = (%s)\n", message)
	if err != nil {
		fmt.Printf("error = (%s)\n", err.Error())
	} else {
		fmt.Printf("no errors in checking image")
	}
}
