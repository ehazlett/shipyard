describe("module:ng.service:$window", function() {
  beforeEach(function() {
    browser.get("./examples/example-example65/index.html");
  });

 it('should display the greeting in the input box', function() {
  element(by.model('greeting')).sendKeys('Hello, E2E Tests');
  // If we click the button it will block the test runner
  // element(':button').click();
 });
});
