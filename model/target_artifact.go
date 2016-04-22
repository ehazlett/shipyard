package model

type TargetArtifact struct {
	//    ID           string `json:"-" gorethink:"id,omitempty"`
	ID string `json:"id" gorethink:"artifactId,omitempty"`
	//ArtifactId   string `json:"artifactId,omitempty" gorethink:"artifactId,omitempty"`
	//    ArtifactType string `json:"type" gorethink:"type"`
	ArtifactType string `json:"type" gorethink:"type"`
}

func (t *TargetArtifact) NewTargetArtifact(artifactId string, artifactType string) *TargetArtifact {

	return &TargetArtifact{
		//        ArtifactId:   artifactId,
		ID:           artifactId,
		ArtifactType: artifactType,
	}
}
