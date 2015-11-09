var React = require("react");
var moment = require("moment");
var utils = require("./utils.js");
var api = require("../api.js");
require('jquery-tablesort');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            volumes: []
        }
    },
    componentDidMount: function() {
        api.listVolumes({}, function(err, data){
            this.setState({
                volumes: data
            })
        }.bind(this));
    },
    componentDidUpdate: function() {
        $('.sortable.table').tablesort();
    },
    render: function() {
        return (
            <div className="ui grey segment">
                <h2 className="ui header">Volumes</h2>
                { this.state.volumes.length > 20 &&
                    <div className="ui top right attached label gray">{this.state.volumes.length} Volumes</div>
                }
		<table className="ui sortable celled table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Driver</th>
                            <th>Mountpoint</th>
                            <th>Node</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.volumes.map(function(v, i){
                            var name = v.Name;
                            var driver = v.Driver;
                            var mountpoint = v.Mountpoint;
                            var node = v.Engine.Name;
                            return <tr key={i}>
                                <td>{name}</td>
                                <td>{driver}</td>
                                <td>{mountpoint}</td>
                                <td>{node}</td>
                                <td className="collapsing"><div className="ui icon tiny red button"><i className="trash icon"></i></div></td>
                                </tr>
                                ;
                        })}
                    </tbody>
                  </table>
            </div>
        )
    }
});

