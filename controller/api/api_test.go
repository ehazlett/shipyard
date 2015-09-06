package api

import (
	log "github.com/Sirupsen/logrus"
	"github.com/shipyard/shipyard/controller/mock_test"
)

func getTestApi() (*Api, error) {
	log.SetLevel(log.ErrorLevel)
	m := mock_test.MockManager{}
	config := ApiConfig{
		ListenAddr:         "",
		Manager:            m,
		AuthWhiteListCIDRs: nil,
		EnableCORS:         false,
		AllowInsecure:      true,
		TLSCertPath:        "",
		TLSKeyPath:         "",
	}

	return NewApi(config)
}
