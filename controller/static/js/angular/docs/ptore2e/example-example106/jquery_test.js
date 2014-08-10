describe("module", function() {
  beforeEach(function() {
    browser.get("./examples/example-example106/index-jquery.html");
  });

  it('should add Hello to the name', function() {
    expect(element(by.binding("{{ greeting }}")).getText()).toEqual('Bonjour World!');
  });
});
