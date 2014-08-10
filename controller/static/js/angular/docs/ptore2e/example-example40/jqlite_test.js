describe("module:ng.directive:ngNonBindable", function() {
  beforeEach(function() {
    browser.get("./examples/example-example40/index.html");
  });

 it('should check ng-non-bindable', function() {
   expect(element(by.binding('1 + 2')).getText()).toContain('3');
   expect(element.all(by.css('div')).last().getText()).toMatch(/1 \+ 2/);
 });
});
