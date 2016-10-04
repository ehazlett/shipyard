package v2

import ()

type (
	Tag struct {
		Name string
	}

	FsLayer struct {
		BlobSum string `json:"blobSum"`
	}

	JSONWebKey struct {
		CRV string `json:"crv"`
		KID string `json:"kid"`
		KTY string `json:"kty"`
		X   string `json:"x"`
		Y   string `json:"y"`
	}

	Header struct {
		JSONWebKey JSONWebKey `json:"jwk"`
		Algorithm  string     `json:"alg"`
	}

	Signature struct {
		Header    Header `json:"header"`
		Signature string `json:"signature`
		Protected string `json:"protected"`
	}

	Repository struct {
		SchemaVersion int         `json:"schemaVersion,omitempty"`
		Digest        string      `json:"digest,omitempty"`
		Name          string      `json:"name"`
		Tag           string      `json:"tag"`
		Architecture  string      `json:"architecture"`
		FsLayers      []FsLayer   `json:"fsLayers"`
		Signatures    []Signature `json:"signatures"`
	}
)
