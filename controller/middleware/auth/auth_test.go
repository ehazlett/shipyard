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

	a := NewAuthRequired(nil, []string{})
	a.Handler(testHandler).ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401; got %s", res.Code)
	}
}

func TestWhiteListAny(t *testing.T) {
	res := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)

	a := NewAuthRequired(nil, []string{})
	a.Handler(testHandler).ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401; got %d", res.Code)
	}

	res = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/", nil)

	a = NewAuthRequired(nil, []string{"0.0.0.0"})
	a.Handler(testHandler).ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200; got %d", res.Code)
	}
}

func TestWhiteListInvalid(t *testing.T) {
	res := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/", nil)

	a := NewAuthRequired(nil, []string{"1.2.3.4/32"})
	a.Handler(testHandler).ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401; got %d", res.Code)
	}
}
