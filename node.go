package shipyard

type Node struct {
	ID           string  `json:"id,omitempty" gorethink:"id,omitempty"`
	Name         string  `json:"name,omitempty" gorethink:"name,omitempty"`
	Addr         string  `json:"addr,omitempty" gorethink:"addr,omitempty"`
	ResponseTime float64 `json:"response_time" gorethink:"response_time,omitempty"`
}

type NodeDeployConfig struct {
	Name       string   `json:"name,omitempty"`
	DriverName string   `json:"driver_name,omitempty"`
	SwarmToken string   `json:"swarm_token,omitempty"`
	Params     []string `json:"params,omitempty"`
}

type NodeProviderParam struct {
	Key         string `json:"key,omitempty"`
	Description string `json:"description,omitempty"`
	Required    bool   `json:"required,omitempty"`
}

type NodeProvider struct {
	Name        string              `json:"name,omitempty"`
	DriverName  string              `json:"driver_name,omitempty"`
	Description string              `json:"description,omitempty"`
	URL         string              `json:"url,omitempty"`
	Params      []NodeProviderParam `json:"params,omitempty"`
}

func DefaultNodeProviders() []*NodeProvider {
	providers := []*NodeProvider{}

	ec2 := &NodeProvider{
		Name:        "Amazon EC2",
		DriverName:  "amazonec2",
		URL:         "http://aws.amazon.com",
		Description: "Amazon Elastic Compute Service",
		Params: []NodeProviderParam{
			{
				Key:         "amazonec2-access-key",
				Description: "AWS Access Key ID",
				Required:    true,
			},
			{
				Key:         "amazonec2-secret-key",
				Description: "AWS Secret Access Key",
				Required:    true,
			},
			{
				Key:         "amazonec2-vpc-id",
				Description: "AWS VPC ID",
				Required:    true,
			},
		},
	}

	providers = append(providers, ec2)

	do := &NodeProvider{
		Name:        "DigitalOcean",
		DriverName:  "digitalocean",
		URL:         "http://digitalocean.com",
		Description: "Simple cloud hosting, built for developers",
		Params: []NodeProviderParam{
			{
				Key:         "digitalocean-access-token",
				Description: "DigialOcean Access Token",
				Required:    true,
			},
		},
	}

	providers = append(providers, do)

	rs := &NodeProvider{
		Name:        "Rackspace",
		DriverName:  "rackspace",
		URL:         "http://www.rackspace.com",
		Description: "Managed VMs and bare-metal servers in the cloud",
		Params: []NodeProviderParam{
			{
				Key:         "rackspace-api-key",
				Description: "Rackspace API Key",
				Required:    true,
			},
			{
				Key:         "rackspace-region",
				Description: "Rackspace Region",
				Required:    true,
			},
			{
				Key:         "rackspace-username",
				Description: "Rackspace Username",
				Required:    true,
			},
		},
	}

	providers = append(providers, rs)

	azure := &NodeProvider{
		Name:        "Microsoft Azure",
		DriverName:  "azure",
		URL:         "http://azure.microsoft.com",
		Description: "Cloud Computing Platform & Services",
		Params: []NodeProviderParam{
			{
				Key:         "azure-subscription-id",
				Description: "Azure Subscription ID",
				Required:    true,
			},
			{
				Key:         "azure-subscription-cert",
				Description: "Azure Subscription Certificate",
				Required:    true,
			},
		},
	}

	providers = append(providers, azure)

	return providers
}
