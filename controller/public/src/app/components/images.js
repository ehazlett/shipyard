var React = require("react");
var moment = require("moment");
var utils = require("./utils.js");
var api = require("../api.js");
require('jquery-tablesort');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            images: []
        }
    },
    componentDidMount: function() {
        api.listImages({all: true}, function(err, data){
            this.setState({
                images: data
            })
        }.bind(this));
    },
    componentDidUpdate: function() {
        $('.sortable.table').tablesort();
        $('.popup').popup({hoverable: true, position: "top left"});
    },
    render: function() {
        return (
            <div className="ui grey segment">
                <h2 className="ui header">Images</h2>
                { this.state.images.length > 20 &&
                    <div className="ui top right attached label gray">{this.state.images.length} Images</div>
                }
		<table className="ui sortable celled table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Virtual Size</th>
                            <th>Created</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.images.map(function(img, i){
                            var name = img.RepoTags[0];
                            var createdTimestamp = moment(img.Created*1000).fromNow();
                            var createdTimestampFull = moment(img.Created*1000).format('LLLL');
                            var size = utils.formatBytes(img.Size);
                            var virtualSize = utils.formatBytes(img.VirtualSize);
                            return <tr key={i}>
                                <td>{img.Id}</td>
                                <td>{name}</td>
                                <td>{size}</td>
                                <td>{virtualSize}</td>
                                <td><span className="popup pointer" data-content={createdTimestampFull} data-variation="inverted">{createdTimestamp}</span></td>
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

