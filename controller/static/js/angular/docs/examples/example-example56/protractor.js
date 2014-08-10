  var numLimitInput = element(by.model('numLimit'));
  var letterLimitInput = element(by.model('letterLimit'));
  var limitedNumbers = element(by.binding('numbers | limitTo:numLimit'));
  var limitedLetters = element(by.binding('letters | limitTo:letterLimit'));

  it('should limit the number array to first three items', function() {
    expect(numLimitInput.getAttribute('value')).toBe('3');
    expect(letterLimitInput.getAttribute('value')).toBe('3');
    expect(limitedNumbers.getText()).toEqual('Output numbers: [1,2,3]');
    expect(limitedLetters.getText()).toEqual('Output letters: abc');
  });

  it('should update the output when -3 is entered', function() {
    numLimitInput.clear();
    numLimitInput.sendKeys('-3');
    letterLimitInput.clear();
    letterLimitInput.sendKeys('-3');
    expect(limitedNumbers.getText()).toEqual('Output numbers: [7,8,9]');
    expect(limitedLetters.getText()).toEqual('Output letters: ghi');
  });

  it('should not exceed the maximum size of input array', function() {
    numLimitInput.clear();
    numLimitInput.sendKeys('100');
    letterLimitInput.clear();
    letterLimitInput.sendKeys('100');
    expect(limitedNumbers.getText()).toEqual('Output numbers: [1,2,3,4,5,6,7,8,9]');
    expect(limitedLetters.getText()).toEqual('Output letters: abcdefghi');
  });