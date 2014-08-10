describe("module:ng.directive:ngBind", function() {
  beforeEach(function() {
    browser.get("./examples/example-example14/index-jquery.html");
  });

  it('should check ng-bind', function() {
    var nameInput = element(by.model('name'));

    expect(element(by.binding('name')).getText()).toBe('Whirled');
    nameInput.clear();
    nameInput.sendKeys('world');
    expect(element(by.binding('name')).getText()).toBe('world');
  });
});
