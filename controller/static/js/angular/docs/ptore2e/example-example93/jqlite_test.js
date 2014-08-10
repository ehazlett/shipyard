describe("expression", function() {
  beforeEach(function() {
    browser.get("./examples/example-example93/index.html");
  });

  it('should calculate expression in binding', function() {
    if (browser.params.browser == 'safari') {
      // Safari can't handle dialogs.
      return;
    }
    element(by.css('[ng-click="greet()"]')).click();

    var alertDialog = browser.switchTo().alert();

    expect(alertDialog.getText()).toEqual('Hello World');

    alertDialog.accept();
  });
});
