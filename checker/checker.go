package checker

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/coreos/clair/api/v1"
	"github.com/shipyard/shipyard/model"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"sync"
	"time"
)

var (
	server_exists bool = false
)

const (
	postLayerURI         = "/v1/layers"
	getLayerFeaturesURI  = "/v1/layers/%s?vulnerabilities"
	CLAIR_ENDPOINT       = "http://clair:6060"
	FILE_SERVER_ENDPOINT = "http://controller:9279"
	FILE_SERVER_ROOT     = "/tmp/"
)

func StartImageFileServer(fileServerRoot string) {
	//Setup a simple HTTP server if Clair is not local.
	if !server_exists {
		parts := strings.Split(FILE_SERVER_ENDPOINT, ":")
		if len(parts) < 3 {
			fmt.Errorf("Did not pass valid endpoint for File Server = %s", FILE_SERVER_ENDPOINT)
			return
		}
		server_exists = true
		go listenHTTP(fileServerRoot, parts[2])
	}
}

func formatImageLayerTarEndpoint(fileServerEndpoint, fileServerLayerPath, fileServerLayerId string) string {
	return fileServerEndpoint + "/" + fileServerLayerPath + "/" + fileServerLayerId + "/layer.tar"
}

func cleanupStrangeCharacters(s string) string {
	return strings.Replace(strings.Replace(s, `\"`, "", -1), `"`, "", -1)
}

func CheckImage(image *model.Image) ([]string, bool, error) {
	log.Debugf("starting checker...")
	StartImageFileServer(FILE_SERVER_ROOT)

	results := []string{}
	endpoint := CLAIR_ENDPOINT
	imageName := image.Name + ":" + image.Tag
	isSafe := false

	// Save image.
	log.Debugf("Saving %s", imageName)
	path, err := save(imageName)
	defer os.RemoveAll(path)

	// Check if image could be saved
	if err != nil {
		resultEntry := fmt.Sprintf("Could not save image: %s", err)

		log.Error(resultEntry)

		results = append(results, resultEntry)
		return results, isSafe, errors.New(fmt.Sprintf("Could not save image: %s with error %s", imageName, err.Error()))
	}

	// Retrieve history.
	log.Debug("Getting image's history")
	layerIDs, err := historyFromManifest(path)
	if err != nil {
		log.Debugf("Could not get history from manifest")
		layerIDs, err = historyFromCommand(imageName)
	}

	log.Debugf("Layer IDs = %v", layerIDs)

	if err != nil || len(layerIDs) == 0 {
		resultEntry := fmt.Sprintf("Could not get history for image %s: %s", imageName, err.Error())
		log.Debugf(resultEntry)
		results = append(results, resultEntry)
		return results, isSafe, errors.New(resultEntry)
	}

	// Analyze all layers.
	log.Debugf("Analyzing %d layers", len(layerIDs))
	pathWithoutRoot := strings.TrimPrefix(path, FILE_SERVER_ROOT)
	layerAnalysisErrors := []string{}
	for i := 0; i < len(layerIDs); i++ {
		log.Debugf("- Analyzing %s", layerIDs[i])

		remaining := ""
		var err error
		if i > 0 {
			remaining = layerIDs[i-1]
		}

		err = analyzeLayer(endpoint, formatImageLayerTarEndpoint(FILE_SERVER_ENDPOINT, pathWithoutRoot, layerIDs[i]), layerIDs[i], remaining)

		// If there was an error, track it and continue to the next layer
		if err != nil {
			resultEntry := fmt.Sprintf("Could not analyze layer: %s using %s %s error: %s", layerIDs[i], endpoint, path, err.Error())
			log.Debugf(resultEntry)
			results = append(results, resultEntry)
			layerAnalysisErrors = append(layerAnalysisErrors, resultEntry)
			return results, isSafe, err
		}

		// There was no error in analysis so add result
		resultEntry := fmt.Sprintf("Successfully analyzed layer: %s using %s %s", layerIDs[i], endpoint, path)
		results = append(results, resultEntry)
	}

	// If there was ANY error of analysis we should exit out, \
	// but at least we will get all the results for all layers of the image
	if len(layerAnalysisErrors) > 0 {
		results = append(results, "Found errors in analysis of layers")
		return results, isSafe, errors.New("Found errors in analysis of layers")
	}

	// Get features and vulnerabilities.
	log.Debugf("Getting image %s features and vulnerabilities", imageName)
	// TODO: why are we sending the id of the last layer only and not all Ids in a loop?
	layerId := layerIDs[len(layerIDs)-1]
	layer, err := getLayer(endpoint, layerId)
	if err != nil {
		resultEntry := fmt.Sprintf("Could not get features and vulnerabilities for layer %s of image %s, error information %s", layer.Name, imageName, err.Error())
		log.Errorf(resultEntry)
		results = append(results, resultEntry)
		return results, isSafe, errors.New(resultEntry)
	}

	// Print report.
	results = append(results, fmt.Sprintf("Clair report for image %s at %s", imageName, time.Now().UTC()))
	log.Debug(results)

	if len(layer.Features) == 0 {
		resultEntry := fmt.Sprintf("No features were found in image %s", imageName)
		results = append(results, resultEntry)
		resultEntry = "Which typically means that the image is not supported by Clair."
		results = append(results, resultEntry)
		return results, isSafe, errors.New(resultEntry)
	}

	var once sync.Once
	doOnce := func() {
		results = append(results, fmt.Sprintf("featureName,featureVersion,featureAddedBy,vulName,vulSeverity,vulLink,vulDescription,vulFixedBy,vulMetadata"))
	}
	vuls := []*model.Vulnerability{}
	for _, feature := range layer.Features {

		myFeature := &model.Feature{}
		myFeature.Name = cleanupStrangeCharacters(feature.Name)
		myFeature.Version = cleanupStrangeCharacters(feature.Version)
		myFeature.AddedBy = cleanupStrangeCharacters(feature.AddedBy)

		featureMsg := fmt.Sprintf("Found feature: %s, version: %s, added by: %s", feature.Name, feature.Version, feature.AddedBy)
		results = append(results, featureMsg)
		log.Info(featureMsg)

		if len(feature.Vulnerabilities) > 0 {
			myFeature.AddedBy = feature.AddedBy
			once.Do(doOnce)
			for _, vulnerability := range feature.Vulnerabilities {
				myVulnerability := &model.Vulnerability{
					Name:        cleanupStrangeCharacters(vulnerability.Name),
					Severity:    cleanupStrangeCharacters(vulnerability.Severity),
					Link:        cleanupStrangeCharacters(vulnerability.Link),
					Description: cleanupStrangeCharacters(vulnerability.Description),
					FixedBy:     cleanupStrangeCharacters(vulnerability.FixedBy),
					Metadata:    cleanupStrangeCharacters(fmt.Sprintf("%+v", vulnerability.Metadata)),
				}

				log.Errorf("Found vulnerability %s", myVulnerability.Name)
				vuls = append(vuls, myVulnerability)

				//add vulnerability
				resultEntry := fmt.Sprintf("%s,%s,%s,%s,%s,%s,%s,%s",
					cleanupStrangeCharacters(myFeature.Name),
					cleanupStrangeCharacters(myFeature.Version),
					cleanupStrangeCharacters(myFeature.AddedBy),
					myVulnerability.Name,
					myVulnerability.Severity,
					myVulnerability.Link,
					myVulnerability.Description,
					myVulnerability.FixedBy,
					//myVulnerability.Metadata,
				)
				results = append(results, resultEntry)
			}
		}
	}

	vulLen := len(vuls)
	resultEntry := "Clair results summary:"
	results = append(results, resultEntry)

	// If we found NO vulnerabilties then we mark the image check as SAFE
	resultLabel := "FAILURE:"
	if vulLen == 0 {
		// The only place were the image is marked as Safe
		isSafe = true
		resultLabel = "SUCCESS:"
	}
	results = append(results, fmt.Sprintf("%s Clair found %d vulnerabilties in image %s.", resultLabel, vulLen, imageName))

	// We return nil for error since there was no execution error.
	// This is regardless of finding vulnerabilities or not.
	return results, isSafe, nil
}

func save(imageName string) (string, error) {
	path, err := ioutil.TempDir(FILE_SERVER_ROOT, "analyze-local-image-")
	if err != nil {
		return "", err
	}

	var stderr bytes.Buffer
	save := exec.Command("docker", "save", imageName)
	save.Stderr = &stderr
	extract := exec.Command("tar", "xf", "-", "-C", path)
	extract.Stderr = &stderr
	pipe, err := extract.StdinPipe()
	if err != nil {
		return "", err
	}
	save.Stdout = pipe

	err = extract.Start()
	if err != nil {
		return "", errors.New(stderr.String())
	}
	err = save.Run()
	if err != nil {
		return "", errors.New(stderr.String())
	}
	err = pipe.Close()
	if err != nil {
		return "", err
	}
	err = extract.Wait()
	if err != nil {
		return "", errors.New(stderr.String())
	}

	return path, nil
}

func historyFromManifest(path string) ([]string, error) {
	mf, err := os.Open(path + "/manifest.json")
	if err != nil {
		return nil, err
	}
	defer mf.Close()

	// https://github.com/docker/docker/blob/master/image/tarexport/tarexport.go#L17
	type manifestItem struct {
		Config   string
		RepoTags []string
		Layers   []string
	}

	var manifest []manifestItem
	if err = json.NewDecoder(mf).Decode(&manifest); err != nil {
		return nil, err
	} else if len(manifest) != 1 {
		return nil, err
	}
	var layers []string
	for _, layer := range manifest[0].Layers {
		layers = append(layers, strings.TrimSuffix(layer, "/layer.tar"))
	}
	return layers, nil
}

func historyFromCommand(imageName string) ([]string, error) {
	var stderr bytes.Buffer
	cmd := exec.Command("docker", "history", "-q", "--no-trunc", imageName)
	cmd.Stderr = &stderr
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return []string{}, err
	}

	err = cmd.Start()
	if err != nil {
		return []string{}, errors.New(stderr.String())
	}

	var layers []string
	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		layers = append(layers, scanner.Text())
	}

	for i := len(layers)/2 - 1; i >= 0; i-- {
		opp := len(layers) - 1 - i
		layers[i], layers[opp] = layers[opp], layers[i]
	}

	return layers, nil
}

func listenHTTP(path string, port string) {
	fmt.Printf("Setting up HTTP server on local root path %s \n", path)

	if port == "" || path == "" {
		fmt.Errorf("Empty values passed to listeHTTP(path=%s, port=%s)", path, port)
		return
	}
	err := http.ListenAndServe(":"+port, http.FileServer(http.Dir(path)))
	if err != nil {
		fmt.Printf("- An error occured with the HTTP server: %s\n", err.Error())
		return
	}
}

func analyzeLayer(clairEndpoint, layerEndpoint, layerName, parentLayerName string) error {
	payload := v1.LayerEnvelope{
		Layer: &v1.Layer{
			Name:       layerName,
			Path:       layerEndpoint,
			ParentName: parentLayerName,
			Format:     "Docker",
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	requestEndpoint := clairEndpoint + postLayerURI

	request, err := http.NewRequest("POST", requestEndpoint, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	response, err := client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode != 201 {
		body, _ := ioutil.ReadAll(response.Body)
		return fmt.Errorf("- Got response %d with message %s", response.StatusCode, string(body))
	}

	return nil
}

func getLayer(endpoint, layerID string) (v1.Layer, error) {
	response, err := http.Get(endpoint + fmt.Sprintf(getLayerFeaturesURI, layerID))
	if err != nil {
		return v1.Layer{}, err
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		body, _ := ioutil.ReadAll(response.Body)
		err := fmt.Errorf("- Got response %d with message %s", response.StatusCode, string(body))
		return v1.Layer{}, err
	}

	var apiResponse v1.LayerEnvelope
	if err = json.NewDecoder(response.Body).Decode(&apiResponse); err != nil {
		return v1.Layer{}, err
	} else if apiResponse.Error != nil {
		return v1.Layer{}, errors.New(apiResponse.Error.Message)
	}

	return *apiResponse.Layer, nil
}
