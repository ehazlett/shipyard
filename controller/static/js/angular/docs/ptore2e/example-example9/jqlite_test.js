describe("module:ng.directive:ngReadonly", function() {
  beforeEach(function() {
    browser.get("./examples/example-example9/index.html");
  });

  it('should toggle readonly attr', function() {
    expect(element(by.css('[type="text"]')).getAttribute('readonly')).toBeFalsy();
    element(by.model('checked')).click();
    expect(element(by.css('[type="text"]')).getAttribute('readonly')).toBeTruthy();
  });
});
