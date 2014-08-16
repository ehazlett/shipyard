package middleware

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

	a := NewAuthRequired()
	a.Handler(testHandler).ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401; got %s", res.Code)
	}
}

func TestAuthToken(t *testing.T) {
	res := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)
	req.Header.Add("AUTH_TOKEN", "foo")

	a := NewAuthRequired()
	a.Handler(testHandler).ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200; got %s", res.Code)
	}
	resp := res.Body.String()
	if resp != "testing" {
		t.Fatalf("expected \"testing\"; got %s", resp)
	}
}
