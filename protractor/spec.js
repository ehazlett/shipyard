// spec.js
describe('Protractor Demo App', function() {
    it('should have a title', function() {
        browser.get('http://'+process.env.DOCKER_HOST+':8888');

        expect(browser.getTitle()).toEqual('shipyardd');
    });
});
