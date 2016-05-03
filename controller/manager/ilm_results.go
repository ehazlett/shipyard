package manager

import (
	"fmt"
	r "github.com/dancannon/gorethink"
	"github.com/shipyard/shipyard/model"
)

// Methods related to the results structure
func (m DefaultManager) GetResults(projectId string) (*model.Result, error) {

	res, err := r.Table(tblNameResults).Filter(map[string]string{"projectId": projectId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	var result *model.Result
	if err := res.One(&result); err != nil {
		return nil, err
	}
	return result, nil
}

func (m DefaultManager) GetResult(projectId, resultId string) (*model.Result, error) {
	res, err := r.Table(tblNameResults).Filter(map[string]string{"id": resultId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrResultDoesNotExist
	}
	var result *model.Result
	if err := res.One(&result); err != nil {
		return nil, err
	}
	return result, nil
}

func (m DefaultManager) CreateResult(projectId string, result *model.Result) error {
	var eventType string

	tmpResult, err := m.GetResult(projectId, result.ID)
	if err != nil && err != ErrResultDoesNotExist {
		return err
	}

	if tmpResult != nil {
		return ErrResultExists
	}

	result.ProjectId = projectId
	response, err := r.Table(tblNameResults).Insert(result).RunWrite(m.session)

	if err != nil {
		return err
	}
	eventType = "add-result"

	result.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()

	m.logEvent(eventType, fmt.Sprintf("id=%s", result.ID), []string{"security"})

	return nil
}
func (m DefaultManager) UpdateResult(projectId string, inputResult *model.Result) error {
	var eventType string

	// check if exists; if so, update
	existingResult, err := m.GetResults(projectId)
	if err != nil && err != ErrResultDoesNotExist {
		return err
	}
	// update
	if existingResult != nil {
		for _, result := range inputResult.TestResults {
			existingResult.TestResults = append(existingResult.TestResults, result)
		}

		if _, err := r.Table(tblNameResults).Filter(map[string]string{"projectId": projectId}).Update(existingResult).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-result"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s", existingResult.ID), []string{"security"})

	return nil
}
func (m DefaultManager) DeleteResult(projectId string, resultId string) error {
	res, err := r.Table(tblNameResults).Filter(map[string]string{"id": resultId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrResultDoesNotExist
	}

	m.logEvent("delete-result", fmt.Sprintf("id=%s", resultId), []string{"security"})

	return nil
}
func (m DefaultManager) DeleteAllResults() error {
	_, err := r.Table(tblNameResults).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}
