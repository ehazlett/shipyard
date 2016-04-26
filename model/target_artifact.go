package model

type TargetArtifact struct {
	ID           string `json:"id" gorethink:"artifactId,omitempty"`
	ArtifactType string `json:"type" gorethink:"type"`
}

func (t *TargetArtifact) NewTargetArtifact(artifactId string, artifactType string) *TargetArtifact {

	return &TargetArtifact{
		ID:           artifactId,
		ArtifactType: artifactType,
	}
}
