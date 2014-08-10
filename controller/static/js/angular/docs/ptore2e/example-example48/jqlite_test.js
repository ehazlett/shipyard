describe("module:ng.directive:script", function() {
  beforeEach(function() {
    browser.get("./examples/example-example48/index.html");
  });

  it('should load template defined inside script tag', function() {
    element(by.css('#tpl-link')).click();
    expect(element(by.css('#tpl-content')).getText()).toMatch(/Content of the template/);
  });
});
