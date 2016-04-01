package tlsutils

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"errors"
	"io/ioutil"
	"math/big"
	"net"
	"os"
	"path/filepath"
	"time"

	log "github.com/Sirupsen/logrus"
)

var (
	ErrNotRSAPrivateKey = errors.New("private key is not an RSA key")
)

const (
	systemCertPath = "/etc/ssl"
)

func loadSystemCertificates(certPool *x509.CertPool) error {
	if _, err := os.Stat(systemCertPath); os.IsNotExist(err) {
		return nil
	}

	log.Debugf("loading system certificates: dir=%s", systemCertPath)

	return filepath.Walk(systemCertPath, func(path string, fi os.FileInfo, err error) error {
		if !fi.IsDir() {
			cert, err := ioutil.ReadFile(path)
			if err != nil {
				return err
			}

			certPool.AppendCertsFromPEM(cert)
		}
		return nil
	})
}

// GetServerTLSConfig returns a TLS config for using with ListenAndServeTLS
// This sets up the Root and Client CAs for verification
func GetServerTLSConfig(caCert, serverCert, serverKey []byte, allowInsecure bool) (*tls.Config, error) {
	// TLS config
	var tlsConfig tls.Config
	tlsConfig.InsecureSkipVerify = allowInsecure
	certPool := x509.NewCertPool()

	// load system certs
	if err := loadSystemCertificates(certPool); err != nil {
		return nil, err
	}

	// append custom CA
	certPool.AppendCertsFromPEM(caCert)

	tlsConfig.RootCAs = certPool
	tlsConfig.ClientCAs = certPool

	log.Debugf("tls root CAs: %d", len(tlsConfig.RootCAs.Subjects()))

	// require client auth
	tlsConfig.ClientAuth = tls.VerifyClientCertIfGiven

	// server cert
	keypair, err := tls.X509KeyPair(serverCert, serverKey)
	if err != nil {
		return &tlsConfig, err

	}
	tlsConfig.Certificates = []tls.Certificate{keypair}

	if allowInsecure {
		tlsConfig.InsecureSkipVerify = true
	}

	return &tlsConfig, nil
}

func newCertificate(org string) (*x509.Certificate, error) {
	now := time.Now()
	// need to set notBefore slightly in the past to account for time
	// skew in the VMs otherwise the certs sometimes are not yet valid
	notBefore := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute()-5, 0, 0, time.Local)
	notAfter := notBefore.Add(time.Hour * 24 * 1080)

	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		return nil, err

	}

	return &x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Organization: []string{org},
		},
		NotBefore: notBefore,
		NotAfter:  notAfter,

		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature | x509.KeyUsageKeyAgreement,
		BasicConstraintsValid: true,
	}, nil

}

// GenerateCACertificate generates a new certificate authority from the specified org
// and bit size and returns the certificate and key as []byte, []byte
func GenerateCACertificate(org string, bits int) ([]byte, []byte, error) {
	template, err := newCertificate(org)
	if err != nil {
		return nil, nil, err
	}

	template.IsCA = true
	template.KeyUsage |= x509.KeyUsageCertSign
	template.KeyUsage |= x509.KeyUsageKeyEncipherment
	template.KeyUsage |= x509.KeyUsageKeyAgreement

	priv, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		return nil, nil, err
	}

	derBytes, err := x509.CreateCertificate(rand.Reader, template, template, &priv.PublicKey, priv)
	if err != nil {
		return nil, nil, err
	}

	var certOut bytes.Buffer
	var keyOut bytes.Buffer

	pem.Encode(&certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	pem.Encode(&keyOut, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(priv)})

	return certOut.Bytes(), keyOut.Bytes(), nil
}

// GenerateCert generates a new certificate signed using the provided
// certificate authority certificate and key byte arrays.  It will return
// the generated certificate and key as []byte, []byte
func GenerateCert(hosts []string, caCert []byte, caKey []byte, org string, bits int) ([]byte, []byte, error) {
	template, err := newCertificate(org)
	if err != nil {
		return nil, nil, err
	}

	// client
	if len(hosts) == 1 && hosts[0] == "" {
		template.ExtKeyUsage = []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth}
		template.KeyUsage = x509.KeyUsageDigitalSignature
	} else { // server
		template.ExtKeyUsage = []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth}
		for _, h := range hosts {
			if ip := net.ParseIP(h); ip != nil {
				template.IPAddresses = append(template.IPAddresses, ip)
			} else {
				template.DNSNames = append(template.DNSNames, h)
			}
		}
	}

	tlsCert, err := tls.X509KeyPair(caCert, caKey)
	if err != nil {
		return nil, nil, err
	}

	priv, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		return nil, nil, err
	}

	x509Cert, err := x509.ParseCertificate(tlsCert.Certificate[0])
	if err != nil {
		return nil, nil, err
	}

	derBytes, err := x509.CreateCertificate(rand.Reader, template, x509Cert, &priv.PublicKey, tlsCert.PrivateKey)
	if err != nil {
		return nil, nil, err
	}

	var certOut bytes.Buffer
	var keyOut bytes.Buffer

	pem.Encode(&certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	pem.Encode(&keyOut, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(priv)})

	return certOut.Bytes(), keyOut.Bytes(), nil
}

// GetPublicKey returns the RSA public key for the specified private key
func GetPublicKey(priv interface{}) (*rsa.PublicKey, error) {
	if k, ok := priv.(*rsa.PrivateKey); ok {
		return &k.PublicKey, nil
	}

	return nil, ErrNotRSAPrivateKey
}
