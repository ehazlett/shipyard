	// TODO: Provide a backend API to get a list of available roles
export const accountRoles = [
  { text: "Administrator", value: "admin" },
  { text: "Containers Read-Only", value: "containers:ro" },
  { text: "Containers Read/Write", value: "containers:rw" },
  { text: "Images Read-Only", value: "images:ro" },
  { text: "Images Read/Write", value: "images:rw" },
  { text: "Nodes Read-Only", value: "nodes:ro" },
  { text: "Nodes Read/Write", value: "nodes:rw" },
  { text: "Registries Read-Only", value: "registries:ro" },
  { text: "Registries Read/Write", value: "registries:rw" },
  { text: "Events Read-Only", value: "events:ro" },
  { text: "Events Read/Write", value: "events:rw" },
];
