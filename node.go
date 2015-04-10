package shipyard

type NodeHealth struct {
	Status       string  `json:"status,omitempty" gorethink:"status,omitempty"`
	Up           bool    `json:"up,omitempty" gorethink:"up,omitempty"`
	ResponseTime float64 `json:"response_time" gorethink:"response_time,omitempty"`
}
type Node struct {
	ID        string `json:"id,omitempty" gorethink:"id,omitempty"`
	Name      string `json:"name,omitempty" gorethink:"name,omitempty"`
	Addr      string `json:"addr,omitempty" gorethink:"addr,omitempty"`
	TLSCACert []byte `json:"tls_ca_cert,omitempty" gorethink:"tls_ca_cert,omitempty"`
	TLSCert   []byte `json:"tls_cert,omitempty" gorethink:"tls_cert,omitempty"`
	TLSKey    []byte `json:"tls_key,omitempty" gorethink:"tls_key,omitempty `
}
