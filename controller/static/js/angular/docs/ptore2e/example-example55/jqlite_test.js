describe("module:ng.filter:json", function() {
  beforeEach(function() {
    browser.get("./examples/example-example55/index.html");
  });

  it('should jsonify filtered objects', function() {
    expect(element(by.binding("{'name':'value'}")).getText()).toMatch(/\{\n  "name": ?"value"\n}/);
  });
});
