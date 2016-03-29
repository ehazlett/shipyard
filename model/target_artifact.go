package model

type TargetArtifact struct {
	ID           string `json:"id,omitempty" gorethink:"id,omitempty"`
	ArtifactType string `json:"type" gorethink:"type"`
}

func (t *TargetArtifact) NewTargetArtifact(artifactType string) *TargetArtifact {

	return &TargetArtifact{
		ArtifactType: artifactType,
	}
}
