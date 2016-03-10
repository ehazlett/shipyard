package checker

import (
	"testing"
)

func TestImage(t *testing.T) {
	CheckImage("marvambass/nginx-registry-proxy")
}
