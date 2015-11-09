var React = require("react");
var Menu = require("./menu.js");
var Footer = require("./footer.js");
var Volumes = require('./components/volumes.js');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="pusher">
                <Menu />

                <Volumes />

                <Footer />
            </div>
        )
    }
});
