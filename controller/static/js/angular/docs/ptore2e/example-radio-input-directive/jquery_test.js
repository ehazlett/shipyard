describe("module:ng.input:input[radio]", function() {
  beforeEach(function() {
    browser.get("./examples/example-radio-input-directive/index-jquery.html");
  });

  it('should change state', function() {
    var color = element(by.binding('color'));

    expect(color.getText()).toContain('blue');

    element.all(by.model('color')).get(0).click();

    expect(color.getText()).toContain('red');
  });
});
