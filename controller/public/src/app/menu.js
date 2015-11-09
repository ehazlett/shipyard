var React = require("react");
var navigate = require('react-mini-router').navigate;
var auth = require("./auth.js");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            isLoggedIn: false
        }
    },
    componentDidMount() {
        this.setState({
            isLoggedIn: auth.isLoggedIn()
        });
        $(".ui.dropdown").dropdown();
    },
    click: function(path) {
        navigate(path);
    },
    handleLogout: function() {
        auth.logout();
    },
    render: function () {
        return (
            <div className="ui large fixed menu">
                <div className="item"><img src="./assets/images/logo.png"></img> <span className="logo-text">Shipyard</span></div>
                {(this.state.isLoggedIn && 
                    <a className="item" onClick={this.click.bind(this, "/")}><i className="dashboard icon"></i> Dashboard</a>
                )}
                {(this.state.isLoggedIn && 
                    <a className="item" onClick={this.click.bind(this, "/containers")}><i className="cube icon"></i> Containers</a>
                )}
                {(this.state.isLoggedIn && 
                    <a className="item" onClick={this.click.bind(this, "/images")}><i className="tasks icon"></i> Images</a>
                )}
                {(this.state.isLoggedIn && 
                    <a className="item" onClick={this.click.bind(this, "/volumes")}><i className="disk outline icon"></i> Volumes</a>
                )}
                {(this.state.isLoggedIn && 
                    <a className="item" onClick={this.click.bind(this, "/networks")}><i className="sitemap icon"></i> Networks</a>
                )}
                {(this.state.isLoggedIn && 
                    <a className="item" onClick={this.click.bind(this, "/stats")}><i className="bar chart icon"></i> Stats</a>
                )}
                {(this.state.isLoggedIn && 
                    <a className="ui button right item" onClick={this.handleLogout}>Logout</a>
                )}
            </div>
        )
    }
});
