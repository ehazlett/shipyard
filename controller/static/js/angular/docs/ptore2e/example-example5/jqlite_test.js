describe("module:ng.service:$compile", function() {
  beforeEach(function() {
    browser.get("./examples/example-example5/index.html");
  });

  it('should auto compile', function() {
    var textarea = $('textarea');
    var output = $('div[compile]');
    // The initial state reads 'Hello Angular'.
    expect(output.getText()).toBe('Hello Angular');
    textarea.clear();
    textarea.sendKeys('{{name}}!');
    expect(output.getText()).toBe('Angular!');
  });
});
