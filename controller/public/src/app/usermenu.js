var navigate = require('react-mini-router').navigate;
var auth = require('./auth.js');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            username: auth.getUsername()
        }
    },
    componentDidMount() {
        this.setState({username: auth.getUsername()});
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
            <div className="ui dropdown usermenu">
                <div>{this.state.username} <i className="dropdown icon"></i></div>
                <div className="menu">
                    <a onClick={this.click.bind(this, "/settings")} className="item">Settings</a>
                    <div className="divider"/>
                    <a onClick={this.handleLogout} className="item">Logout</a>
                </div>
              </div>
        )
    }
});
