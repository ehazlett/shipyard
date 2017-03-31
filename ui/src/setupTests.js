var localStorageMock = (function() {
  var store = {};
  return {
    getItem: function(key) {
      // Browser returns null when a key is not found in localStorage
      if (typeof store[key] === "undefined") {
        return null;
      }
      return store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;
