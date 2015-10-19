var Menu = require("./menu.js");
var Footer = require("./footer.js");
var navigate = require('react-mini-router').navigate;

var SignupForm = React.createClass({
    click: function(path) {
        navigate(path);
    },
    render: function() {
        return (
            <div className="ui vertical signup">
                <div className="ui middle aligned grid container">
                    <div className="four wide column"></div>
                    <div className="eight wide column">
                        <div className="ui segment">
                            <form className="ui form">
                                <div className="two fields">
                                    <div className="field">
                                        <label>First Name</label>
                                        <input type="text" name="firstName" placeholder=""/>
                                    </div>
                                    <div className="field">
                                        <label>Last Name</label>
                                        <input type="text" name="lastName" placeholder=""/>
                                    </div>
                                </div>
                                <div className="two fields">
                                    <div className="field">
                                        <label>Username</label>
                                        <input type="text" name="username" placeholder=""/>
                                    </div>
                                    <div className="field">
                                        <label>Zipcode</label>
                                        <input type="text" name="zipcode" placeholder=""/>
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Email</label>
                                    <input type="text" name="email" placeholder=""/>
                                </div>
                                <div className="field">
                                    <label>Password</label>
                                    <input type="password" name="password" placeholder=""/>
                                </div>
                                <div className="field">
                                    <p>By signing up, you agree to the <a onClick={this.click.bind(this, "/terms")}>Terms and Conditions</a></p>
                                </div>
                                <a className="ui green fluid button">Signup</a>
                            </form>
                        </div>
                    </div>
                    <div className="four wide column"></div>
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

                <SignupForm />

                <Footer />
            </div>
        )
    }
});
