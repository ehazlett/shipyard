describe("module:ng.directive:ngChecked", function() {
  beforeEach(function() {
    browser.get("./examples/example-example8/index.html");
  });

  it('should check both checkBoxes', function() {
    expect(element(by.id('checkSlave')).getAttribute('checked')).toBeFalsy();
    element(by.model('master')).click();
    expect(element(by.id('checkSlave')).getAttribute('checked')).toBeTruthy();
  });
});
