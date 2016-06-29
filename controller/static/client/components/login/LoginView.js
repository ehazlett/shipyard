import React from 'react';

const LoginView = React.createClass({
  tryLogin() {
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    this.props.login(username, password);
  },
  render() {
    return (
      <div className="ui middle aligned center aligned grid">
        <div className="column">
          <h2 className="ui teal image header">
            <div className="content">
              Log-in to your account
            </div>
          </h2>
          <form className="ui large form">
            <div className="ui stacked segment">
              <div className="field">
                <div className="ui left icon input">
                  <i className="user icon"></i>
                  <input type="text" name="username" ref="username" placeholder="Username"></input>
                </div>
              </div>
              <div className="field">
                <div className="ui left icon input">
                  <i className="lock icon"></i>
                  <input type="password" name="password" ref="password" placeholder="Password"></input>
                </div>
              </div>
              <div className="ui fluid large teal submit button" onClick={this.tryLogin}>Login</div>
            </div>

            <div className="ui error message"></div>

          </form>

        </div>
      </div>
    );
  }
});

export default LoginView;
