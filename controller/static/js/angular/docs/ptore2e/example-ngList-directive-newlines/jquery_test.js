describe("module:ng.directive:ngList", function() {
  beforeEach(function() {
    browser.get("./examples/example-ngList-directive-newlines/index-jquery.html");
  });

  it("should split the text by newlines", function() {
    var listInput = element(by.model('list'));
    var output = element(by.binding('{{ list | json }}'));
    listInput.sendKeys('abc\ndef\nghi');
    expect(output.getText()).toContain('[\n  "abc",\n  "def",\n  "ghi"\n]');
  });
});
