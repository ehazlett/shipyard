  it('should change state', function() {
    var value1 = element(by.binding('value1'));
    var value2 = element(by.binding('value2'));

    expect(value1.getText()).toContain('true');
    expect(value2.getText()).toContain('YES');

    element(by.model('value1')).click();
    element(by.model('value2')).click();

    expect(value1.getText()).toContain('false');
    expect(value2.getText()).toContain('NO');
  });