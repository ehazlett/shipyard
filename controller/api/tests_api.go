package api

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/mux"
	"github.com/shipyard/shipyard/model"
	"net/http"
)

func (a *Api) createTest(w http.ResponseWriter, r *http.Request) {
	//add code to create a test and return the appropriate response
	/*post:
	  description: Create a new test for a given project
	  body:
	    application/json:
	      type: Test
	  responses:
	    201:
	      body:
	        application/json:
	          type: ObjectCreatedResponse
	    500:
	      body:
	        text/plain:
	          type: Error
	*/

	vars := mux.Vars(r)
	projectId := vars["projectId"]
	w.Header().Set("content-type", "application/json")
	var test *model.Test
	if err := json.NewDecoder(r.Body).Decode(&test); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := a.manager.CreateTest(projectId, test); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Debugf("saved test: id=%s", test.ID)

	// Just return the id for the Project that was created.
	tempResponse := map[string]string{
		"id": test.ID,
	}

	jsonResponse, err := json.Marshal(tempResponse)

	if err != nil {
		// Most probably a 400 BadRequest would be sufficient
		http.Error(w, err.Error(), http.StatusNoContent)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(jsonResponse)
	return

}

func (a *Api) getTests(w http.ResponseWriter, r *http.Request) {
	/*       # GET /api/projects/{projectId}/tests
	         get:
	           description: Get all tests for a give project
	           responses:
	             200:
	               body:
	                 application/json:
	                   type: Test[]
	             500:
	               body:
	                 text/plain:
	                   type: Error*/
	w.Header().Set("content-type", "application/json")
	vars := mux.Vars(r)
	projId := vars["projectId"]
	tests, err := a.manager.GetTests(projId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(w).Encode(tests); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) getTest(w http.ResponseWriter, r *http.Request) {
	/*  # GET /api/projects/{projectId}/tests/{testId}
	    get:
	      description: Get one project test by its id for a given project.
	      responses:
	        200:
	          body:
	            application/json:
	              type: Test
	        500:
	          body:
	            text/plain:
	              type: Error
	        404:
	          description: When either projectId or testId are not found.
	          body:
	            text/plain:
	              type: Error
	              examples:
	                - content: |
	                    Could not get test with id c38129ed-9ec4-40be-9682-b48a1834b2c2
	                    since project with id e30f964e-1207-4e4a-9630-b58d1f36ceec not found.
	                - content: |
	                    Test with id c38129ed-9ec4-40be-9682-b48a1834b2c2 not found.*/
	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]

	test, err := a.manager.GetTest(projId, testId)
	if err != nil {
		log.Errorf("error retrieving result: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(test); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Api) updateTest(w http.ResponseWriter, r *http.Request) {
	/*# PUT /api/projects/{projectId}/tests/{testId}
	  put:
	    description: Update a project test by its id for a given project
	    body:
	      application/json:
	        type: Test
	    responses:
	      201:
	        body:
	          application/json:
	            type: ObjectCreatedResponse
	      404:
	        description: When either projectId or testId are not found.
	        body:
	          text/plain:
	            type: Error
	            examples:
	              - content: |
	                  Could not update test with id c38129ed-9ec4-40be-9682-b48a1834b2c2
	                  since project with id e30f964e-1207-4e4a-9630-b58d1f36ceec not found.
	              - content: |
	                  Test with id c38129ed-9ec4-40be-9682-b48a1834b2c2 not found.
	      500:
	        body:
	          text/plain:
	            type: Error
	*/
	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]

	test, err := a.manager.GetTest(projId, testId)
	if err != nil {
		log.Errorf("error updating test: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&test); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := a.manager.UpdateTest(projId, test); err != nil {
		log.Errorf("error updating result: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Debugf("updated test: id=%s", test.ID)
	w.WriteHeader(http.StatusNoContent)
}

func (a *Api) deleteTest(w http.ResponseWriter, r *http.Request) {
	/*    # DELETE /api/proejcts/{projectId}/tests/{testId}
	      delete:
	        description: "Delete a project test by its id for a given project"

	        responses:
	          204:
	            body:
	              text/plain: !!null

	          404:
	            description: When either projectId or testId are not found.
	            body:
	              text/plain:
	                type: Error
	                examples:
	                  - content: |
	                      Could not delete test with id c38129ed-9ec4-40be-9682-b48a1834b2c2
	                      since project with id e30f964e-1207-4e4a-9630-b58d1f36ceec not found.
	                  - content: |
	                      Test with id c38129ed-9ec4-40be-9682-b48a1834b2c2 not found.
	          500:
	            body:
	              text/plain:
	                type: Error*/
	vars := mux.Vars(r)
	projId := vars["projectId"]
	testId := vars["testId"]

	test, err := a.manager.GetTest(projId, testId)
	if err != nil {
		log.Errorf("error deleting test: %s", err)
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if err := a.manager.DeleteTest(projId, testId); err != nil {
		log.Errorf("error deleting test: %s", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Infof("deleted test: id=%s", test.ID)
	w.WriteHeader(http.StatusNoContent)
}
