describe("services", function() {
  beforeEach(function() {
    browser.get("./examples/example-example110/index.html");
  });

  it('should test service', function() {
    expect(element(by.id('simple')).element(by.model('message')).getAttribute('value'))
        .toEqual('test');
  });
});
