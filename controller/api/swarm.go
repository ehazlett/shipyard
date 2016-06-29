package api

import (
	"bytes"
	"io"
	"net"
	"net/http"

	log "github.com/Sirupsen/logrus"
)

const (
	dockerSocket = "/var/run/docker.sock"
)

func (a *Api) swarmRedirect(w http.ResponseWriter, r *http.Request) {
	var c net.Conn

	cl, err := net.Dial("unix", dockerSocket)
	if err != nil {
		// TODO: panic and shut down if unable to connect to backend
		log.Errorf("error connecting to backend: %s", err)
		return
	}

	c = cl
	hj, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "hijack error", 500)
		return
	}
	nc, _, err := hj.Hijack()
	if err != nil {
		log.Printf("hijack error: %v", err)
		return
	}
	defer nc.Close()
	defer c.Close()

	err = r.Write(c)
	if err != nil {
		log.Printf("error copying request to target: %v", err)
		return
	}

	errc := make(chan error, 2)
	cp := func(dst io.Writer, src io.Reader) {
		_, err := io.Copy(dst, src)
		errc <- err
	}
	go cp(c, nc)
	go cp(nc, c)
	<-errc
}

type proxyWriter struct {
	Body       *bytes.Buffer
	Headers    *map[string][]string
	StatusCode *int
}

func (p proxyWriter) Header() http.Header {
	return *p.Headers
}
func (p proxyWriter) Write(data []byte) (int, error) {
	return p.Body.Write(data)
}
func (p proxyWriter) WriteHeader(code int) {
	*p.StatusCode = code
}
