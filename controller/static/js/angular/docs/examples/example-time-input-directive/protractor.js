   var value = element(by.binding('value | date: "HH:mm"'));
   var valid = element(by.binding('myForm.input.$valid'));
   var input = element(by.model('value'));

   // currently protractor/webdriver does not support
   // sending keys to all known HTML5 input controls
   // for various browsers (https://github.com/angular/protractor/issues/562).
   function setInput(val) {
     // set the value of the element and force validation.
     var scr = "var ipt = document.getElementById('exampleInput'); " +
     "ipt.value = '" + val + "';" +
     "angular.element(ipt).scope().$apply(function(s) { s.myForm[ipt.name].$setViewValue('" + val + "'); });";
     browser.executeScript(scr);
   }

   it('should initialize to model', function() {
     expect(value.getText()).toContain('14:57');
     expect(valid.getText()).toContain('myForm.input.$valid = true');
   });

   it('should be invalid if empty', function() {
     setInput('');
     expect(value.getText()).toEqual('value =');
     expect(valid.getText()).toContain('myForm.input.$valid = false');
   });

   it('should be invalid if over max', function() {
     setInput('23:59');
     expect(value.getText()).toContain('');
     expect(valid.getText()).toContain('myForm.input.$valid = false');
   });