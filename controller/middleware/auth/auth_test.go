package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

var testHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("testing"))
})

func TestNoAuthToken(t *testing.T) {
	res := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)

	a := NewAuthRequired(nil)
	a.Handler(testHandler).ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401; got %s", res.Code)
	}
}
