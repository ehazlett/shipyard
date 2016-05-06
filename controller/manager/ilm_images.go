package manager

import (
	"errors"
	"fmt"
	log "github.com/Sirupsen/logrus"
	r "github.com/dancannon/gorethink"
	"github.com/samalba/dockerclient"
	apiClient "github.com/shipyard/shipyard/client"
	"github.com/shipyard/shipyard/model"
	"sort"
	"time"
)

var (
	ErrImageWasEmpty       = errors.New("image name was empty, please pass a valid object")
	ErrDomainNoLongerValid = "ErrorDomainNoLongerValid"
)

// check if an image exists
func (m DefaultManager) VerifyIfImageExistsLocally(imageToCheck string) bool {

	//images, err := m.client.ListImages(true)

	images, err := apiClient.GetLocalImages(m.DockerClient().URL.String())

	if err != nil {
		log.Error(err)
		return false
	}

	for _, img := range images {
		imageRepoTags := img.RepoTags
		for _, imageRepoTag := range imageRepoTags {
			if imageRepoTag == imageToCheck {
				fmt.Printf("Image %s exists locally as %s \n", imageToCheck, imageRepoTag)
				return true
			}
		}
	}

	return false
}

func (m DefaultManager) PullImage(pullableImageName string, username, password string) error {
	if pullableImageName == "" {
		return ErrImageWasEmpty
	}
	auth := dockerclient.AuthConfig{username, password, ""}

	fmt.Printf("Image does not exist locally. Pulling image %s ... \n", pullableImageName)
	ticker := time.NewTicker(time.Second * 15)
	go func() {
		for t := range ticker.C {
			fmt.Print("Time: ", t.UTC())
			fmt.Printf(" Pulling image: %s. Please be patient while the process finishes ... \n", pullableImageName)
		}
	}()

	// TODO: stop using samalba/dockerclient, use Docker, Inc docker engine client library instead
	err := m.client.PullImage(pullableImageName, &auth)

	if err != nil {
		fmt.Printf("Could not pull image %s ... \n %s \n", pullableImageName, err)
		ticker.Stop()
		return err
	}
	ticker.Stop()

	return nil
}

//methods related to the Image structure
func (m DefaultManager) GetImages(projectId string) ([]*model.Image, error) {

	res, err := r.Table(tblNameImages).Filter(map[string]string{"projectId": projectId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	images := []*model.Image{}
	if err := res.All(&images); err != nil {
		return nil, err
	}

	for _, image := range images {
		m.injectRegistryInfo(image)
	}
	return images, nil
}

func (m DefaultManager) GetImage(projectId string, imageId string) (*model.Image, error) {
	var image *model.Image
	res, err := r.Table(tblNameImages).Filter(map[string]string{"id": imageId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrImageDoesNotExist
	}
	if err := res.One(&image); err != nil {
		return nil, err
	}

	m.injectRegistryInfo(image)
	return image, nil
}

func (m DefaultManager) injectRegistryInfo(image *model.Image) {
	if image.RegistryId != "" {
		registry, err := m.Registry(image.RegistryId)
		domain := ErrDomainNoLongerValid
		if err == nil {
			domain = formatRegistryDomain(registry.Addr)
		}
		image.RegistryDomain = domain
	}
}

func (m DefaultManager) CreateImage(projectId string, image *model.Image) error {
	var eventType string
	image.ProjectId = projectId

	m.injectRegistryInfo(image)
	response, err := r.Table(tblNameImages).Insert(image).RunWrite(m.session)
	if err != nil {

		return err
	}
	image.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()
	eventType = "add-image"

	m.logEvent(eventType, fmt.Sprintf("id=%s", image.ID), []string{"security"})
	return nil
}

func (m DefaultManager) UpdateImage(projectId string, image *model.Image) error {
	var eventType string
	// check if exists; if so, update
	rez, err := m.GetImage(projectId, image.ID)
	if err != nil && err != ErrImageDoesNotExist {
		return err
	}
	// update
	if rez == nil {
		return ErrImageDoesNotExist
	}

	m.injectRegistryInfo(image)

	// Convert struct to map and refrain from doing this manually
	updates := map[string]interface{}{
		"name":           image.Name,
		"imageId":        image.ImageId,
		"tag":            image.Tag,
		"ilmTags":        image.IlmTags,
		"description":    image.Description,
		"registryId":     image.RegistryId,
		"location":       image.Location,
		"skipImageBuild": image.SkipImageBuild,
		"projectId":      image.ProjectId,
		"registryDomain": image.RegistryDomain,
	}
	if _, err := r.Table(tblNameImages).Filter(map[string]string{"id": image.ID}).Update(updates).RunWrite(m.session); err != nil {
		return err
	}

	eventType = "update-image"

	m.logEvent(eventType, fmt.Sprintf("id=%s", image.ID), []string{"security"})
	return nil
}

func (m DefaultManager) UpdateImageIlmTags(projectId string, imageId string, ilmTag string) error {
	var eventType string
	// check if exists; if so, update
	rez, err := m.GetImage(projectId, imageId)
	if err != nil && err != ErrImageDoesNotExist {
		return err
	}

	if rez == nil {
		return ErrImageDoesNotExist
	}

	//sort.Sort(rez.IlmTags)
	sort.Strings(rez.IlmTags)
	index := sort.SearchStrings(rez.IlmTags, ilmTag)
	if len(rez.IlmTags) == index {
		log.Infof("ilm tag %s was NOT found in array %v, appending", ilmTag, rez.IlmTags)
		rez.IlmTags = append(rez.IlmTags, ilmTag)
	}

	if _, err := r.Table(tblNameImages).Filter(map[string]string{"id": imageId}).Update(rez).RunWrite(m.session); err != nil {
		return err
	}

	eventType = "update-image"

	m.logEvent(eventType, fmt.Sprintf("id=%s", imageId), []string{"security"})
	return nil
}

func (m DefaultManager) DeleteImage(projectId string, imageId string) error {
	res, err := r.Table(tblNameImages).Filter(map[string]string{"id": imageId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrImageDoesNotExist
	}

	m.logEvent("delete-image", fmt.Sprintf("id=%s", imageId), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAllImages() error {
	_, err := r.Table(tblNameImages).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}
