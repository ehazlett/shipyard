var React = require('react');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="ui vertical stripe">
                <div className="ui middle aligned stackable grid container">
                    <div id="about" className="row">
                        <div className="eight wide column">
                            <h3 className="ui header">Sample</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                        </div>
                        <div className="six wide right floated column">
                            <img src="http://placehold.it/350x150" className="ui rounded large image"/>
                        </div>
                    </div>
                    <div id="contact" className="row">
                        <div className="eight wide column">
                            <h3>Coming Soon</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});
