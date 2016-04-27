var sy = {
    usernameInputField: by.model('vm.username'),
    passwordInputField: by.model('vm.password'),
    loginSubmitButton: by.css('.ui.blue.submit.button'),
    ilmButton: by.id('ilm-button'),
    createNewProjectButton: by.id('create-new-project-button'),
    createProjectButton: by.id('create-project-button'),
    createProjectName: by.id('create-project-name'),
    createProjectDescription: by.model('vm.project.description'),
    editProjectHeader: by.id('edit-project-header'),
    editProjectName: by.model('vm.project.name'),
    editProjectDescription: by.model('vm.project.description'),
    saveProjectButton: by.id('edit-project-save-project'),
    editProjectSaveSuccess: by.id('edit-project-save-success'),
    editProjectSaveFailure: by.id('edit-project-save-failure'),
    createNewImageButton: by.id('create-new-image-button')
};

function selectDropdownByNumber( mySelect, optionNum ) {
    element.findElements(by.tagName('option'))
        .then(function(options) {
            options[index].click();
        });
};

// TODO: Look into how protractor *knows* when our app is pending tasks. Can we remove tha `browser.waits`?

describe('ILM', function() {
    it('should have a title', function() {
        // TODO: this port might change in the future or could be random in CI environment
        browser.get('http://'+process.env.DOCKER_HOST+':8082');
        expect(browser.getTitle()).toEqual('shipyard');
    });

    it('should be able to login', function() {
        element(sy.usernameInputField).sendKeys('admin ');
        element(sy.passwordInputField).sendKeys('shipyard');
        element(sy.loginSubmitButton).click();
        // browser.wait(protractor.until.elementLocated(sy.ilmButton), 15000);
    });

    it('should be able to navigate to project list', function() {
        element(sy.ilmButton).click();
        // browser.wait(protractor.until.elementLocated(sy.createNewProjectButton), 15000);
    });

    it('should be able to navigate to the project create view', function() {
        element(sy.createNewProjectButton).click();
        // browser.wait(protractor.until.elementLocated(sy.createProjectButton), 15000);
    });
    
    it('should be able to create a new project', function() {
        element(sy.createProjectName).sendKeys('Project1');
        element(sy.createProjectDescription).sendKeys('Description1');
        element(sy.createProjectButton).click();
        // browser.wait(protractor.until.elementLocated(sy.editProjectHeader), 15000);
    });

    it('project should be successfully created', function() {
        expect(
            element(sy.editProjectHeader).getText()
        ).toEqual(
            'Project Project1'
        );
    
        expect(
            element(sy.editProjectName).getAttribute('value')
        ).toEqual(
            'Project1'
        );
    
        expect(
            element(sy.editProjectDescription).getAttribute('value')
        ).toEqual(
            'Description1'
        );
    });

    it('should be able to modify an existing project', function() {
        element(sy.editProjectName).clear();
        element(sy.editProjectName).sendKeys('Project2');
        element(sy.saveProjectButton).click();
        expect(
            element(sy.editProjectName).getAttribute('value')
        ).toEqual(
            'Project2'
        );
    });

    it('open modal window for create image', function() {
        element(sy.createNewImageButton).click();
        expect(element(by.className('ui fullscreen modal transition create image')).isDisplayed()).toBe(true);
        expect(element(by.id('create-image-header')).getText()).toEqual('Create Image');
    });

    it('add new image from public registry', function() {
        element(by.model('vm.createImage.location')).$('[value= "Public Registry"]').click();
        /*var select = by.model('vm.createImage.location');

        selectDropdownByNumber(select,2);*/
        //expect(element(by.model('vm.createImage.location')).getAttribute('value')).toEqual('Public Registry');
        element(by.model('vm.createImage.description')).clear();
        element(by.model('vm.createImage.description')).sendKeys('image description');
    });

    it('close modal window for create image', function() {
        element(by.className('ui negative button create image')).click();
        //expect(element(by.className('ui fullscreen modal transition create image')).isDisplayed()).toBe(false);
    });
    // it('should be able to create a new image', function() {
    //     expect(
    //         element(sy.editProjectHeader).getText()
    //     ).toEqual(
    //         'Project Project1'
    //     );
    //
    //     expect(
    //         element(sy.editProjectName).getAttribute('value')
    //     ).toEqual(
    //         'Project1'
    //     );
    //
    //     expect(
    //         element(sy.editProjectDescription).getAttribute('value')
    //     ).toEqual(
    //         'Description1'
    //     );
    // });

    /*describe('Protractor Demo App', function() {
        it('should have a title', function() {
            // TODO: this port might change in the future or could be random in CI environment
            browser.get('http://'+process.env.DOCKER_HOST+':8082');

            expect(browser.getTitle()).toEqual('shipyardd');
        });
        it('projects page', function() {
            browser.get('http://'+process.env.DOCKER_HOST+':8082');
            var url = browser.driver.getCurrentUrl();
            element( by.css('.title .item .project')).click();
            expect(url).toMatch('/projects');
        });
        /!*it('sign in', function() {
         var username = element(by.model('username'));
         var password = element(by.model('password'));
         username.sendKeys("admin");
         expect(username.getText()).toEqual("admin");
         });*!/
    });*/


});
