var Docker = require("dockerode");
var auth = require("./auth.js");

module.exports = function() {
        var opts = {};
        var username = auth.getUsername();
        var token = auth.getToken();
        if (token === undefined) {
            return null;
        } else {
            opts = {
                extraHeaders: [
                    "X-Access-Token=" + username + ":" + token
                ]
            }
        }
        var d = new Docker(opts);
        return d;
}
