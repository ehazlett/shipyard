var React = require("react");
var Menu = require("./menu.js");
var Footer = require("./footer.js");
var Containers = require('./components/containers.js');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="pusher">
                <Menu />

                <Containers />

                <Footer />
            </div>
        )
    }
});
