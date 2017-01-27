package tlsutils

import (
	"crypto/tls"
	"crypto/x509"
	"testing"
)

const (
	testOrg = "test-org"
	bits    = 2048
)

func TestGenerateCACertificate(t *testing.T) {
	caCert, caKey, err := GenerateCACertificate(testOrg, bits)
	if err != nil {
		t.Fatal(err)
	}

	if caCert == nil {
		t.Fatalf("expected ca cert; received nil")
	}

	if caKey == nil {
		t.Fatalf("expected ca key; received nil")
	}

	keypair, err := tls.X509KeyPair(caCert, caKey)
	if err != nil {
		t.Fatal(err)
	}

	c, err := x509.ParseCertificate(keypair.Certificate[0])
	if err != nil {
		t.Fatal(err)
	}

	if !c.IsCA {
		t.Fatalf("expected CA; received non-CA cert")
	}

	if c.Subject.Organization[0] != testOrg {
		t.Fatalf("expected org %s; received %s", testOrg, c.Subject.Organization[0])
	}
}

func TestGenerateCert(t *testing.T) {
	caCert, caKey, err := GenerateCACertificate(testOrg, bits)
	if err != nil {
		t.Fatal(err)
	}

	if caCert == nil {
		t.Fatalf("expected ca cert; received nil")
	}

	if caKey == nil {
		t.Fatalf("expected ca key; received nil")
	}

	cert, key, err := GenerateCert([]string{}, caCert, caKey, testOrg, bits)
	if err != nil {
		t.Fatal(err)
	}

	if cert == nil {
		t.Fatalf("expected cert; received nil")
	}

	if key == nil {
		t.Fatalf("expected key; received nil")
	}

	keypair, err := tls.X509KeyPair(cert, key)
	if err != nil {
		t.Fatal(err)
	}

	c, err := x509.ParseCertificate(keypair.Certificate[0])
	if err != nil {
		t.Fatal(err)
	}

	if c.IsCA {
		t.Fatalf("expected non-CA; received CA cert")
	}

	if c.Subject.Organization[0] != testOrg {
		t.Fatalf("expected org %s; received %s", testOrg, c.Subject.Organization[0])
	}
}

func TestGetPublicKey(t *testing.T) {
	caCert, caKey, err := GenerateCACertificate(testOrg, bits)
	if err != nil {
		t.Fatal(err)
	}

	if caCert == nil {
		t.Fatalf("expected ca cert; received nil")
	}

	if caKey == nil {
		t.Fatalf("expected ca key; received nil")
	}

	cert, key, err := GenerateCert([]string{}, caCert, caKey, testOrg, bits)
	if err != nil {
		t.Fatal(err)
	}

	if cert == nil {
		t.Fatalf("expected cert; received nil")
	}

	if key == nil {
		t.Fatalf("expected key; received nil")
	}

	keypair, err := tls.X509KeyPair(cert, key)
	if err != nil {
		t.Fatal(err)
	}

	if _, err := GetPublicKey(keypair.PrivateKey); err != nil {
		t.Fatal(err)
	}
}
