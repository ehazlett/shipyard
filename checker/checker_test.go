package checker

import (
	"fmt"
	"testing"
)

func TestImage(t *testing.T) {
	message, _ := CheckImage("marvambass/nginx-registry-proxy")
	fmt.Printf("%s\n", message)
}
