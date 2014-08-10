describe("module:ng.input:input[url]", function() {
  beforeEach(function() {
    browser.get("./examples/example-url-input-directive/index-jquery.html");
  });

  var text = element(by.binding('text'));
  var valid = element(by.binding('myForm.input.$valid'));
  var input = element(by.model('text'));

  it('should initialize to model', function() {
    expect(text.getText()).toContain('http://google.com');
    expect(valid.getText()).toContain('true');
  });

  it('should be invalid if empty', function() {
    input.clear();
    input.sendKeys('');

    expect(text.getText()).toEqual('text =');
    expect(valid.getText()).toContain('false');
  });

  it('should be invalid if not url', function() {
    input.clear();
    input.sendKeys('box');

    expect(valid.getText()).toContain('false');
  });
});
