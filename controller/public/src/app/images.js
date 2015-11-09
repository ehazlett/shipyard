var React = require("react");
var Menu = require("./menu.js");
var Footer = require("./footer.js");
var Images = require('./components/images.js');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="pusher">
                <Menu />

                <Images />

                <Footer />
            </div>
        )
    }
});
