package checker

import (
	"testing"
)

func TestImage(t *testing.T) {
	_ = CheckImage("marvambass/nginx-registry-proxy")
}
