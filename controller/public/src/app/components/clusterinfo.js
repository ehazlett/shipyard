var React = require("react");
var utils = require("./utils.js");
var navigate = require('react-mini-router').navigate;
var api = require('../api.js');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            info: {},
            cpus: 0,
            mem: 0,
            containers: 0,
            images: 0
        }
    },
    componentDidMount: function() {
        api.info(function(err, data) {
            this.setState({
                info: data,
                cpus: data.NCPU,
                mem: utils.formatBytes(data.MemTotal),
                containers: data.Containers,
                images: data.Images
            })
        }.bind(this));
    },
    render: function() {
        return (
            <div className="ui grey segment">
                <h2 className="ui header">Docker Info</h2>
	        <div className="ui four statistics">
                    <div className="statistic">
                        <div className="value">
                            {this.state.cpus}
                        </div>
                        <div className="label">
                            CPUs
                        </div>
                    </div>
                    <div className="statistic">
                        <div className="value">
                            {this.state.mem}
                        </div>
                        <div className="label">
                            Memory
                        </div>
                    </div>
                    <div className="statistic">
                        <div className="value">
                            {this.state.containers}
                        </div>
                        <div className="label">
                            Containers
                        </div>
                    </div>
                    <div className="statistic">
                        <div className="value">
                            {this.state.images}
                        </div>
                        <div className="label">
                            Images
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

