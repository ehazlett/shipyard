package access

type (
	ACL struct {
		RoleName    string
		Description string
		Rules       []*AccessRule
	}

	AccessRule struct {
		Path    string
		Methods []string
	}
)

func defaultAccessLevels() []*ACL {
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

	registriesACLRO := &ACL{
		RoleName:    "registries:ro",
		Description: "Registries Read Only",
		Rules: []*AccessRule{
			{
				Path:    "/api/registries",
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
				Path:    "/api/registries",
				Methods: []string{"GET", "POST", "DELETE"},
			},
		},
	}
	acls = append(acls, registriesACLRW)

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

	return acls
}
