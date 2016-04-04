package dockerhub

type (
	Repository struct {
		Status          string `json:"status,omitempty"`
		Description     string `json:"description,omitempty"`
		IsTrusted       bool   `json:"is_trusted,omitempty"`
		FullDescription string `json:"full_description,omitempty"`
		RepoUrl         string `json:"repo_url,omitempty"`
		Owner           string `json:"owner,omitempty"`
		IsOfficial      bool   `json:"is_official,omitempty"`
		IsPrivate       bool   `json:"is_private,omitempty"`
		Name            string `json:"name,omitempty"`
		Namespace       string `json:"namespace,omitempty"`
		StarCount       int    `json:"star_count,omitempty"`
		CommentCount    int    `json:"comment_count,omitempty"`
		DateCreated     int    `json:"date_created,omitempty"`
		Dockerfile      string `json:"dockerfile,omitempty"`
		RepoName        string `json:"repo_name,omitempty"`
	}
)
