package auth

type (
	ACL struct {
		RoleName    string        `json:"role_name,omitempty"`
		Description string        `json:"description,omitempty"`
		Rules       []*AccessRule `json:"rules,omitempty"`
	}

	AccessRule struct {
		Path    string   `json:"path,omitempty"`
		Methods []string `json:"methods,omitempty"`
	}
)

func DefaultACLs() []*ACL {
	acls := []*ACL{}
	adminACL := &ACL{
		RoleName:    "admin",
		Description: "Administrator",
		Rules: []*AccessRule{
			{
				Path:    "*",
				Methods: []string{"*"},
			},
		},
	}
	acls = append(acls, adminACL)

	containersACLRO := &ACL{
		RoleName:    "containers:ro",
		Description: "Containers Read Only",
		Rules: []*AccessRule{
			{
				Path:    "/containers",
				Methods: []string{"GET"},
			},
		},
	}
	acls = append(acls, containersACLRO)

	containersACLRW := &ACL{
		RoleName:    "containers:rw",
		Description: "Containers",
		Rules: []*AccessRule{
			{
				Path:    "/containers",
				Methods: []string{"GET", "POST", "DELETE"},
			},
		},
	}
	acls = append(acls, containersACLRW)

	eventsACLRO := &ACL{
		RoleName:    "events:ro",
		Description: "Events Read Only",
		Rules: []*AccessRule{
			{
				Path:    "/api/events",
				Methods: []string{"GET"},
			},
		},
	}
	acls = append(acls, eventsACLRO)

	eventsACLRW := &ACL{
		RoleName:    "events:rw",
		Description: "Events",
		Rules: []*AccessRule{
			{
				Path:    "/api/events",
				Methods: []string{"GET", "POST", "DELETE"},
			},
		},
	}
	acls = append(acls, eventsACLRW)

	imagesACLRO := &ACL{
		RoleName:    "images:ro",
		Description: "Images Read Only",
		Rules: []*AccessRule{
			{
				Path:    "/images",
				Methods: []string{"GET"},
			},
		},
	}
	acls = append(acls, imagesACLRO)

	imagesACLRW := &ACL{
		RoleName:    "images:rw",
		Description: "Images",
		Rules: []*AccessRule{
			{
				Path:    "/images",
				Methods: []string{"GET", "POST", "DELETE"},
			},
		},
	}
	acls = append(acls, imagesACLRW)

	nodesACLRO := &ACL{
		RoleName:    "nodes:ro",
		Description: "Nodes Read Only",
		Rules: []*AccessRule{
			{
				Path:    "/api/nodes",
				Methods: []string{"GET"},
			},
		},
	}
	acls = append(acls, nodesACLRO)

	nodesACLRW := &ACL{
		RoleName:    "nodes:rw",
		Description: "Nodes",
		Rules: []*AccessRule{
			{
				Path:    "/api/nodes",
				Methods: []string{"GET", "POST", "DELETE"},
			},
		},
	}
	acls = append(acls, nodesACLRW)

	registriesACLRO := &ACL{
		RoleName:    "registries:ro",
		Description: "Registries Read Only",
		Rules: []*AccessRule{
			{
				Path:    "/api/registry",
				Methods: []string{"GET"},
			},
		},
	}
	acls = append(acls, registriesACLRO)

	registriesACLRW := &ACL{
		RoleName:    "registries:rw",
		Description: "Registries",
		Rules: []*AccessRule{
			{
				Path:    "/api/registry",
				Methods: []string{"GET", "POST", "DELETE"},
			},
		},
	}
	acls = append(acls, registriesACLRW)

	return acls
}
