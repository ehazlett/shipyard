package manager

import (
	"fmt"
	r "github.com/dancannon/gorethink"
	"github.com/shipyard/shipyard/model"
)

//methods related to Test structure

func (m DefaultManager) GetTests(projectId string) ([]*model.Test, error) {

	res, err := r.Table(tblNameTests).Filter(map[string]string{"projectId": projectId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	tests := []*model.Test{}
	if err := res.All(&tests); err != nil {
		return nil, err
	}
	return tests, nil
}

func (m DefaultManager) GetTest(projectId, testId string) (*model.Test, error) {
	var test *model.Test
	res, err := r.Table(tblNameTests).Filter(map[string]string{"id": testId}).Run(m.session)
	if err != nil {
		return nil, err
	}
	if res.IsNil() {
		return nil, ErrTestDoesNotExist
	}
	if err := res.One(&test); err != nil {
		return nil, err
	}

	return test, nil
}

func (m DefaultManager) CreateTest(projectId string, test *model.Test) error {
	var eventType string
	test.ProjectId = projectId
	response, err := r.Table(tblNameTests).Insert(test).RunWrite(m.session)
	if err != nil {

		return err
	}
	test.ID = func() string {
		if len(response.GeneratedKeys) > 0 {
			return string(response.GeneratedKeys[0])
		}
		return ""
	}()
	eventType = "add-test"

	m.logEvent(eventType, fmt.Sprintf("id=%s", test.ID), []string{"security"})
	return nil
}

func (m DefaultManager) UpdateTest(projectId string, test *model.Test) error {
	var eventType string
	// check if exists; if so, update
	rez, err := m.GetTest(projectId, test.ID)
	if err != nil && err != ErrTestDoesNotExist {
		return err
	}
	// update
	if rez != nil {
		updates := map[string]interface{}{
			"projectId":        test.ProjectId,
			"description":      test.Description,
			"name":             test.Name,
			"targets":          test.Targets,
			"selectedTestType": test.SelectedTestType,
			"ProviderType":     test.Provider.ProviderType,
			"providerName":     test.Provider.ProviderName,
			"providerTest":     test.Provider.ProviderTest,
			"onSuccess":        test.Tagging.OnSuccess,
			"onFailure":        test.Tagging.OnFailure,
			"fromTag":          test.FromTag,
			"parameters":       test.Parameters,
		}
		if _, err := r.Table(tblNameTests).Filter(map[string]string{"id": test.ID}).Update(updates).RunWrite(m.session); err != nil {
			return err
		}

		eventType = "update-test"
	}

	m.logEvent(eventType, fmt.Sprintf("id=%s", test.ID), []string{"security"})
	return nil
}

func (m DefaultManager) DeleteTest(projectId string, testId string) error {
	res, err := r.Table(tblNameTests).Filter(map[string]string{"id": testId}).Delete().Run(m.session)
	if err != nil {
		return err
	}

	if res.IsNil() {
		return ErrTestDoesNotExist
	}

	m.logEvent("delete-test", fmt.Sprintf("id=%s", testId), []string{"security"})
	return nil
}
func (m DefaultManager) DeleteAllTests() error {
	_, err := r.Table(tblNameTests).Delete().Run(m.session)

	if err != nil {
		return err
	}

	return nil
}
