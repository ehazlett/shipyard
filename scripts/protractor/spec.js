// spec.js
describe('Protractor Demo App', function() {
    it('should have a title', function() {
        // TODO: this port might change in the future or could be random in CI environment
        browser.get('http://'+process.env.DOCKER_HOST+':8082');

        expect(browser.getTitle()).toEqual('shipyardd');
    });
});
