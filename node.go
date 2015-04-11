package shipyard

type Node struct {
	ID           string  `json:"id,omitempty" gorethink:"id,omitempty"`
	Name         string  `json:"name,omitempty" gorethink:"name,omitempty"`
	Addr         string  `json:"addr,omitempty" gorethink:"addr,omitempty"`
	ResponseTime float64 `json:"response_time" gorethink:"response_time,omitempty"`
}
