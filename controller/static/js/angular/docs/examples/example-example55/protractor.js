  it('should jsonify filtered objects', function() {
    expect(element(by.binding("{'name':'value'}")).getText()).toMatch(/\{\n  "name": ?"value"\n}/);
  });