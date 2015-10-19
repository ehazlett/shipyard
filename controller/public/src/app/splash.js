var Menu = require("./menu.js")
var Masthead = require("./masthead.js")
var Welcome = require("./welcome.js")
var Footer = require("./footer.js")

module.exports = React.createClass({
    render: function () {
        return (
            <div className="pusher">
                <Menu />

                <Masthead />

                <Welcome />

                <Footer />
            </div>
        )
    }
});
