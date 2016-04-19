package model

type TargetArtifact struct {
	ArtifactId   string `json:"artifactId,omitempty" gorethink:"artifactId,omitempty"`
	ArtifactType string `json:"type" gorethink:"type"`
}

func (t *TargetArtifact) NewTargetArtifact(artifactId string, artifactType string) *TargetArtifact {

	return &TargetArtifact{
		ArtifactId:   artifactId,
		ArtifactType: artifactType,
	}
}
