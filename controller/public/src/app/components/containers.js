var React = require("react");
var moment = require("moment");
var navigate = require("react-mini-router").navigate;
var api = require("../api.js");
require('jquery-tablesort');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            containers: []
        }
    },
    componentDidMount: function() {
        api.listContainers({all: true}, function(err, data){
            this.setState({
                containers: data
            })
        }.bind(this));
    },
    componentDidUpdate: function() {
        $('.sortable.table').tablesort();
        $('.ui.dropdown').dropdown();
        $('.popup').popup({hoverable: true, position: "top left"});
    },
    render: function() {
        return (
            <div className="ui grey segment">
                <h2 className="ui header">Containers</h2>
                { this.state.containers.length > 20 &&
                    <div className="ui top right attached label gray">{this.state.containers.length} Containers</div>
                }
		<table className="ui sortable celled table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Image</th>
                            <th>Command</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.containers.map(function(c, i){
                            var name = c.Names[0];
                            var cName = name.substring(1, name.length);
                            var createdTimestamp = moment(c.Created*1000).fromNow();
                            var createdTimestampFull = moment(c.Created*1000).format('MMMM Do YYYY, h:mm:ss a');
                            var stateClass = "green";
                            var cState = 0;
                            if (c.Status.indexOf("Exit") > -1) {
                                stateClass = "red";
                                cState = 2;
                            } else if (c.Status.indexOf("Paused") > -1) {
                                stateClass = "";
                                cState = 1;
                            }
                            var state = "ui empty circular label " + stateClass;
                            var stateStyle = {
                                display: "none"
                            }
                            return <tr key={i}>
                                <td><span className={state}> <span style={stateStyle}>{cState}</span> </span></td>
                                <td>{c.Id}</td>
                                <td>{cName}</td>
                                <td>{c.Image}</td>
                                <td>{c.Command}</td>
                                <td>{c.Status}</td>
                                <td><span className="popup pointer" data-content={createdTimestampFull} data-variation="inverted">{createdTimestamp}</span></td>
                                <td className="collapsing">
                                    <div className="ui icon pointing dropdown tiny button">
                                        <i className="ellipsis vertical icon"></i>
                                        <div className="menu">
                                            <div className="item">Restart</div>
                                            <div className="item">Stop</div>
                                            <div className="item">Destroy</div>
                                        </div>
                                    </div>
                                </td>
                                </tr>
                                ;
                        })}
                    </tbody>
                  </table>
            </div>
        )
    }
});

