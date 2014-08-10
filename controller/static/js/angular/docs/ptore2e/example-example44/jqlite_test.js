describe("module:ng.directive:ngHide", function() {
  beforeEach(function() {
    browser.get("./examples/example-example44/index.html");
  });

  var thumbsUp = element(by.css('span.glyphicon-thumbs-up'));
  var thumbsDown = element(by.css('span.glyphicon-thumbs-down'));

  it('should check ng-show / ng-hide', function() {
    expect(thumbsUp.isDisplayed()).toBeFalsy();
    expect(thumbsDown.isDisplayed()).toBeTruthy();

    element(by.model('checked')).click();

    expect(thumbsUp.isDisplayed()).toBeTruthy();
    expect(thumbsDown.isDisplayed()).toBeFalsy();
  });
});
