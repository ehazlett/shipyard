describe("module:ng.directive:ngSelected", function() {
  beforeEach(function() {
    browser.get("./examples/example-example10/index-jquery.html");
  });

  it('should select Greetings!', function() {
    expect(element(by.id('greet')).getAttribute('selected')).toBeFalsy();
    element(by.model('selected')).click();
    expect(element(by.id('greet')).getAttribute('selected')).toBeTruthy();
  });
});
