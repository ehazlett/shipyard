var React = require("react");
var Menu = require("./menu.js");
var Footer = require("./footer.js");
var ClusterInfo = require('./components/clusterinfo.js');
var auth = require("./auth.js");
var navigate = require("react-mini-router").navigate;

module.exports = React.createClass({
    getInitialState: function() {
        return {
            isLoggedIn: false
        }
    },
    componentDidMount: function() {
        if (auth.isLoggedIn()) {
            this.setState({
                isLoggedIn: true
            });
        }
    },
    componentDidUpdate: function() {
        if (!auth.isLoggedIn()) {
            navigate("/login");
        }
    },
    render: function () {
        return (
            <div className="pusher">
                <Menu />

                {
                    this.state.isLoggedIn &&

                    <ClusterInfo />
                }

                <Footer />
            </div>
        )
    }
});
