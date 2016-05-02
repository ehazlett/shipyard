package model

const (
	TargetArtifactImageType = "image"
)

type TargetArtifact struct {
	ID           string      `json:"id" gorethink:"artifactId,omitempty"`
	ArtifactType string      `json:"type" gorethink:"type"`
	Artifact     interface{} `json:"artifact" gorethink:"artifact"`
}

func NewTargetArtifact(
	artifactId string,
	artifactType string,
	artifact interface{},
) *TargetArtifact {

	return &TargetArtifact{
		ID:           artifactId,
		ArtifactType: artifactType,
		Artifact:     artifact,
	}
}
