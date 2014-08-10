describe("module:ng.directive:ngOpen", function() {
  beforeEach(function() {
    browser.get("./examples/example-example11/index.html");
  });

  it('should toggle open', function() {
    expect(element(by.id('details')).getAttribute('open')).toBeFalsy();
    element(by.model('open')).click();
    expect(element(by.id('details')).getAttribute('open')).toBeTruthy();
  });
});
