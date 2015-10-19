var Menu = require("./menu.js");
var Footer = require("./footer.js");

var auth = require("./auth.js");
var navigate = require('react-mini-router').navigate;

var LoginForm = React.createClass({
    getInitialState: function() {
        return {
            username: "username",
            password: "password",
            error: false,
            errorText: ""
        }
    },
    handleLogin: function() {
        var username = this.state.username;
        var password = this.state.password;

        auth.login(username, password, function(valid, err){
            if (!valid) {
                this.setState({
                    error: true,
                    errorText: err
                });
            }
        }.bind(this));
    },
    handleChange(name, e) {
        switch (name) {
            case "username":
                this.setState({username: e.target.value});
                break;
            case "password":
                this.setState({password: e.target.value});
                break;
        }
    },
    handleSignupClick() {
        navigate("/signup");
    },
    handleEnter(e) {
        // submit when pressing enter
        if (e.keyCode === 13) {
            this.handleLogin();
        }
    },
    onLogout: function() {
        auth.logout(function(){
            this.setState({username: "", password: ""});
        });
    },
    render: function() {
        return (
            <div className="ui vertical login">
                <div className="ui middle aligned grid container">
                    <div className="five wide column"></div>
                    <div className="six wide column">
                        {
                            this.state.error ? (
                                <div className="ui negative message">
                                    <div className="header">
                                        Login Error
                                    </div>
                                    <p>Please check your username and password.  {this.state.errorText}</p>
                                </div>
                            ) : (
                                <div />
                            )
                        }
                        <div className="ui segment">
                            <form className="ui form">
                                <div className="field">
                                    <label>Username</label>
                                    <input type="text" name="username" onChange={this.handleChange.bind(this, "username")} placeholder=""/>
                                </div>
                                <div className="field">
                                    <label>Password</label>
                                    <input type="password" name="password" onChange={this.handleChange.bind(this, "password")} onKeyUp={this.handleEnter} placeholder=""/>
                                </div>
                                <div className="field">
                                    <p>Do not have an account? <a className="pointer" onClick={this.handleSignupClick}>Sign Up</a></p>
                                </div>
                                <a onClick={this.handleLogin} className="ui green button fluid" >Login</a>
                            </form>
                        </div>
                    </div>
                    <div className="five wide column"></div>
                </div>
            </div>
        )
    }
});

module.exports = React.createClass({
    render: function () {
        return (
            <div className="pusher">
                <Menu />

                <LoginForm />

                <Footer />
            </div>
        )
    }
});
