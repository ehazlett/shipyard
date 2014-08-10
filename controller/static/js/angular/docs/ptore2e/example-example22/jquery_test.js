describe("module:ng.directive:ngClick", function() {
  beforeEach(function() {
    browser.get("./examples/example-example22/index-jquery.html");
  });

  it('should check ng-click', function() {
    expect(element(by.binding('count')).getText()).toMatch('0');
    element(by.css('button')).click();
    expect(element(by.binding('count')).getText()).toMatch('1');
  });
});
