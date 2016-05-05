package manager

import (
	"errors"
	"fmt"
	log "github.com/Sirupsen/logrus"
	r "github.com/dancannon/gorethink"
	c "github.com/shipyard/shipyard/checker"
	apiClient "github.com/shipyard/shipyard/client"
	"github.com/shipyard/shipyard/model"
	"sync"
	"time"
)

//methods related to the Build structure
func (m DefaultManager) GetBuilds(projectId string, testId string) ([]*model.Build, error) {
	res, err := r.Table(tblNameBuilds).Filter(map[string]string{"projectId": projectId, "testId": testId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	builds := []*model.Build{}
	if err := res.All(&builds); err != nil {
		return nil, err
	}
	return builds, nil
}

func (m DefaultManager) GetBuild(projectId string, testId string, buildId string) (*model.Build, error) {
	return m.GetBuildById(buildId)
}

func (m DefaultManager) GetBuildById(buildId string) (*model.Build, error) {
	res, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrBuildDoesNotExist
	}
	var build *model.Build
	if err := res.One(&build); err != nil {
		return nil, err
	}
	return build, nil
}

func (m DefaultManager) GetBuildStatus(projectId string, testId string, buildId string) (string, error) {
	build, err := m.GetBuildById(buildId)

	if err != nil {
		log.Errorf("Could not get build status for build= %s err= %s", buildId, err.Error())
		return "", err
	}

	if build.Status == nil {
		errMsg := fmt.Sprintf("Could not get build status for build= %s, status is nil", buildId, err.Error())
		log.Errorf(errMsg)
		return "", errors.New(errMsg)
	}
	return build.Status.Status, nil
}
func (m DefaultManager) GetBuildResults(projectId string, testId string, buildId string) ([]*model.BuildResult, error) {
	build, err := m.GetBuildById(buildId)

	if err != nil {
		log.Errorf("Could not get results for build= %s err= %", buildId, err.Error())
		return nil, err
	}

	return build.Results, nil
}
func (m DefaultManager) CreateBuild(projectId string, testId string, buildAction *model.BuildAction) (string, error) {

	var eventType string
	eventType = eventType
	var build *model.Build

	// In order to create a build we should get a start action
	if buildAction.Action != model.BuildStartActionLabel {
		log.Errorf("Build action should be %s, but received %s, error = %s",
			model.BuildStartActionLabel,
			buildAction.Action,
			ErrBuildActionNotSupported.Error(),
		)
		return "", ErrBuildActionNotSupported
	}

	// Instantiate a new Build object and fill out some fields
	build = &model.Build{}
	build.TestId = testId
	build.ProjectId = projectId
	build.StartTime = time.Now()

	// we change the build's buildStatus to submitted
	build.Status = &model.BuildStatus{Status: model.BuildStatusNewLabel}

	// Get the project related to the Test / Build
	project, err := m.Project(projectId)
	if err != nil && err != ErrProjectDoesNotExist {
		return "", err
	}

	// Get the Test and its TargetArtifacts
	test, err := m.GetTest(projectId, testId)
	if err != nil && err != ErrTestDoesNotExist {
		return "", err
	}
	targetArtifacts := test.Targets

	// we get the ids for the targets we want to test
	targetIds := []string{}
	for _, target := range targetArtifacts {
		targetIds = append(targetIds, target.ID)

	}
	// Retrieve the images from the projectId
	// TODO: Investigate if we can query db for the images matching the Ids in the TargetArtifacts
	projectImages, err := m.GetImages(projectId)
	if err != nil && err != ErrProjectImagesProblem {
		return "", err
	}

	// Collect the images that are TargetArtifacts
	// by comparing the ImageID with the ArtifactId
	imagesToBuild := []*model.Image{}
	for _, image := range projectImages {
		for _, artifactId := range targetIds {
			if image.ID == artifactId {
				imagesToBuild = append(imagesToBuild, image)
			}
		}
	}

	// Store the Build in the table in rethink db
	response, err := r.Table(tblNameBuilds).Insert(build).RunWrite(m.session)
	if err != nil {
		return "", err
	}

	build.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()

	// Start a goroutine that will execute the build non-blocking
	// TODO: this go routine should be replaced eventually to a call to the provider bridge / engine
	go func() {

		var wg sync.WaitGroup
		log.Printf("Processing %d image(s)", len(imagesToBuild))
		// For each image that we target in the test, try to run a build / verification
		name := ""
		for _, image := range imagesToBuild {
			name = image.Name + ":" + image.Tag
			log.Printf("Processing image=%s", name)
			wg.Add(1)

			// Run the verification concurrently for each image and then block to wait for all to finish.
			go m.executeBuildTask(
				project,
				test,
				build,
				image,
				&wg,
			)
		}
		// Block the outer goroutine until ALL the inner goroutines finish
		wg.Wait()
	}()

	// TODO: all these event types should be refactored as constants
	eventType = "add-build"
	m.logEvent(eventType, fmt.Sprintf("id=%s", build.ID), []string{"security"})
	return build.ID, nil
}

// Executes a BuilTask in the background as part of a wait group.
// TODO: We should probably remove the `name` param as we already have the corresponding image object
func (m DefaultManager) executeBuildTask(
	project *model.Project,
	test *model.Test,
	build *model.Build,
	image *model.Image,
	wg *sync.WaitGroup,
) {
	// TODO: need to revisit API spec, there are just too many redundant "Result" types stored,
	// TODO: these should probably just be views of the BuildResults
	// TODO: need to set the author to the real user
	// TODO: use model.NewResult() instead
	result := &model.Result{
		BuildId:     build.ID,
		Author:      "author",
		ProjectId:   project.ID,
		Description: project.Description,
		Updater:     "author",
		CreateDate:  time.Now(),
	}

	// TODO: use model.NewTestResult() instead
	testResult := model.TestResult{}
	testResult.Date = time.Now()
	testResult.TestId = test.ID
	testResult.BuildId = build.ID
	testResult.TestName = test.Name
	testResult.ImageName = image.PullableName()
	testResult.BuildId = build.ID

	username := ""
	password := ""

	if image.RegistryId != "" {
		registry, err := m.Registry(image.RegistryId)
		if err != nil {
			log.Warnf("Could not find registry %s for image %s", image.RegistryId, image.ID)
		} else {
			username = registry.Username
			password = registry.Password
		}
	}

	// When the goroutine finishes, mark this wait group item as done.
	// TODO: perhaps do this only if wg != nil?
	defer wg.Done()

	// Check to see if the image exists locally, if not, try to pull it.
	if !m.VerifyIfImageExistsLocally(image.PullableName()) {
		log.Printf("Image %s not available locally, will try to pull...", image.PullableName())
		if err := m.PullImage(image.PullableName(), username, password); err != nil {
			log.Errorf("Error pulling image %s", image.PullableName())
			return
		}
	}

	// Get all local images
	localImages, err := apiClient.GetLocalImages(m.DockerClient().URL.String())

	// TODO: Refactor this into its own func
	// get the docker image id and append it to the test results
	for _, localImage := range localImages {
		imageRepoTags := localImage.RepoTags
		for _, imageRepoTag := range imageRepoTags {
			if imageRepoTag == image.PullableName() {
				//image.DockerImageId = localImage.ID
				testResult.DockerImageId = localImage.ID
				image.ImageId = localImage.ID
			}
		}
	}

	m.UpdateBuildStatus(build.ID, "running")
	existingResult, _ := m.GetResults(project.ID)

	// Once the image is available, try to test it with Clair
	log.Printf("Will attempt to test image %s with Clair...", image.PullableName())
	resultsSlice, isSafe, err := c.CheckImage(image)

	targetArtifact := model.NewTargetArtifact(
		image.ID,
		model.TargetArtifactImageType,
		image,
	)
	buildResult := model.NewBuildResult(build.ID, targetArtifact, resultsSlice)

	m.UpdateBuildResults(build.ID, *buildResult)
	finishLabel := "finished_failed"

	if isSafe && err == nil {
		// if we don't get an error and we get the isSafe flag == true
		// we mark the test for the image as successful
		finishLabel = "finished_success"
		// if the test is successful, we update the images' ilm tags with the test tags we defined in the case of a success
		m.UpdateImageIlmTags(project.ID, image.ID, test.Tagging.OnSuccess)
		log.Infof("Image %s is safe!", image.PullableName())
	} else {
		// if the test is failed, we update the images' ilm tags with the test tags we defined in the case of a failure
		m.UpdateImageIlmTags(project.ID, image.ID, test.Tagging.OnFailure)
		log.Errorf("Image %s is NOT safe :(", image.PullableName())
	}
	m.UpdateBuildStatus(build.ID, finishLabel)

	testResult.SimpleResult.Status = finishLabel
	testResult.EndDate = time.Now()
	testResult.Blocker = false
	result.TestResults = append(result.TestResults, &testResult)
	result.LastUpdate = time.Now()

	if existingResult != nil {
		m.UpdateResult(project.ID, result)

	} else {
		m.CreateResult(project.ID, result)
	}

}

func (m DefaultManager) UpdateBuild(projectId string, testId string, buildId string, buildAction *model.BuildAction) error {
	var eventType string

	// check if exists; if so, update
	tmpBuild, err := m.GetBuild(projectId, testId, buildId)
	if err != nil && err != ErrBuildDoesNotExist {
		return err
	}
	// update
	if tmpBuild != nil {
		if buildAction.Action == "stop" {
			tmpBuild.Status.Status = "stopped"
			tmpBuild.EndTime = time.Now()
			// go StopCurrentBuildFromClair
		}
		if buildAction.Action == "restart" {
			tmpBuild.Status.Status = "restarted"
			tmpBuild.EndTime = time.Now()
			// go RestartCurrentBuildFromClair

		}

		if _, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Update(tmpBuild).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-build"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil

}

func (m DefaultManager) UpdateBuildResults(buildId string, result model.BuildResult) error {
	var eventType string
	build, err := m.GetBuildById(buildId)
	if err != nil {
		return err
	}
	build.Results = append(build.Results, &result)

	if _, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Update(build).RunWrite(m.session); err != nil {
		return err
	}

	eventType = "update-build-results"

	m.logEvent(eventType, fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil
}
func (m DefaultManager) UpdateBuildStatus(buildId string, status string) error {
	var eventType string
	build, err := m.GetBuildById(buildId)
	if err != nil {
		return err
	}
	build.Status.Status = status

	if _, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Update(build).RunWrite(m.session); err != nil {
		return err
	}

	eventType = "update-build-status"

	m.logEvent(eventType, fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil
}
func (m DefaultManager) DeleteBuild(projectId string, testId string, buildId string) error {
	build, err := r.Table(tblNameBuilds).Filter(map[string]string{"id": buildId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if build.IsNil() {
		return ErrBuildDoesNotExist
	}

	m.logEvent("delete-build", fmt.Sprintf("id=%s", buildId), []string{"security"})

	return nil
}

func (m DefaultManager) DeleteAllBuilds() error {
	_, err := r.Table(tblNameBuilds).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}
