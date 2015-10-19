var Menu = require('./menu.js');
var Footer = require('./footer.js');

var Missing = React.createClass({
    render() {
        return (
            <div className="ui vertical">
                <div className="ui middle aligned grid container center notfound">
                    <div className="sixteen wide column">
                        <img src="assets/images/warning.png"/>
                        <h2 className="ui header">Sorry, {this.props.path} was not found.</h2>
                    </div>
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

                <Missing path={this.props.path} />

                <Footer />
            </div>
        )
    }
});
