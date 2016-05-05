package manager

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"
	"time"

	"github.com/shipyard/shipyard/model"
)

func generateId(n int) string {
	hash := sha256.New()
	hash.Write([]byte(time.Now().String()))
	md := hash.Sum(nil)
	mdStr := hex.EncodeToString(md)
	return mdStr[:n]
}

func parseClusterNodes(driverStatus [][]string) ([]*model.Node, error) {
	nodes := []*model.Node{}
	var node *model.Node
	nodeComplete := false
	name := ""
	addr := ""
	containers := ""
	reservedCPUs := ""
	reservedMemory := ""
	labels := []string{}
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

		if strings.Index(label, " └") == -1 {
			name = label
			addr = data
		}

		// node info like "Containers"
		switch label {
		case " └ Containers":
			containers = data
		case " └ Reserved CPUs":
			reservedCPUs = data
		case " └ Reserved Memory":
			reservedMemory = data
		case " └ Labels":
			lbls := strings.Split(data, ",")
			labels = lbls
			nodeComplete = true
		default:
			continue
		}

		if nodeComplete {
			node = &model.Node{
				Name:           name,
				Addr:           addr,
				Containers:     containers,
				ReservedCPUs:   reservedCPUs,
				ReservedMemory: reservedMemory,
				Labels:         labels,
			}
			nodes = append(nodes, node)

			// reset info
			name = ""
			addr = ""
			containers = ""
			reservedCPUs = ""
			reservedMemory = ""
			labels = []string{}
			nodeComplete = false
		}
	}

	return nodes, nil
}

func formatRegistryDomain(registryAddress string) string {
	// TODO: Improve this camel-ostrich with a real regex :)
	return strings.TrimSuffix(
		strings.TrimPrefix(
			strings.TrimPrefix(registryAddress, "https://"),
			"http://",
		), "/")
}
