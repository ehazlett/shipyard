describe("module:ng.directive:ngCloak", function() {
  beforeEach(function() {
    browser.get("./examples/example-example21/index-jquery.html");
  });

  it('should remove the template directive and css class', function() {
    expect($('#template1').getAttribute('ng-cloak')).
      toBeNull();
    expect($('#template2').getAttribute('ng-cloak')).
      toBeNull();
  });
});
