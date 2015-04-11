package manager

import (
	"crypto/sha256"
	"crypto/tls"
	"crypto/x509"
	"encoding/hex"
	"strings"
	"time"

	"github.com/shipyard/shipyard"
)

func getTLSConfig(caCert, sslCert, sslKey []byte) (*tls.Config, error) {
	// TLS config
	var tlsConfig tls.Config
	tlsConfig.InsecureSkipVerify = true
	certPool := x509.NewCertPool()

	certPool.AppendCertsFromPEM(caCert)
	tlsConfig.RootCAs = certPool
	cert, err := tls.X509KeyPair(sslCert, sslKey)
	if err != nil {
		return &tlsConfig, err
	}
	tlsConfig.Certificates = []tls.Certificate{cert}

	return &tlsConfig, nil
}

func generateId(n int) string {
	hash := sha256.New()
	hash.Write([]byte(time.Now().String()))
	md := hash.Sum(nil)
	mdStr := hex.EncodeToString(md)
	return mdStr[:n]
}

func parseClusterNodes(driverStatus [][]string) ([]*shipyard.Node, error) {
	nodes := []*shipyard.Node{}
	for _, l := range driverStatus {
		if len(l) != 2 {
			continue
		}
		label := l[0]
		data := l[1]

		// cluster info label i.e. "Filters" or "Strategy"
		if strings.Index(label, "\u0008") > -1 {
			continue
		}

		// cluster info like "Containers"
		if strings.Index(label, " └") > -1 {
			continue
		}

		// parse node
		node := &shipyard.Node{
			Name: label,
			Addr: data,
		}

		// TODO: get response time
		nodes = append(nodes, node)
	}

	return nodes, nil
}
