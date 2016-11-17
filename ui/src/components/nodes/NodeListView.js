import React from 'react';

import { Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

class NodeListView extends React.Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
    this.renderNode = this.renderNode.bind(this);
  }

  componentDidMount() {
    this.props.fetchNodes();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderNode(node) {
    return (
      <Tr key={node.ID}>
        <Td column="" className="collapsing">
          <Icon className={`circle ${node.Status.State === 'ready' ? 'green' : 'red'}`} />
        </Td>
        <Td column="ID" className="collapsing">
          <Link to={`/nodes/${node.ID}`}>{node.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Hostname">{node.Description.Hostname}</Td>
        <Td column="OS">
          <span>{node.Description.Platform.OS} {node.Description.Platform.Architecture}</span>
        </Td>
        <Td column="Engine">{node.Description.Engine.EngineVersion}</Td>
        <Td column="Type">{node.ManagerStatus ? 'Manager' : 'Worker'}</Td>
        <Td column="&nbsp;" className="collapsing">
          <div className="ui simple dropdown">
            <i className="dropdown icon"></i>
            <div className="menu">
              <div className="item">Accept</div>
              <div className="item">Reject</div>

              <div className="item">Activate</div>
              <div className="item">Pause</div>
              <div className="item">Drain</div>

              <div className="item">Disconnect</div>

              <div className="item">Promote</div>
              <div className="item">Demote</div>
            </div>
          </div>
        </Td>
      </Tr>
    );
  }

  render() {
    return (
      <Segment className={`basic ${this.props.services.loading ? 'loading' : ''}`}>
        <Grid>
          <Grid.Row>
            <Grid.Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column className="right aligned ten wide" />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['Hostname', 'OS', 'Engine', 'Type']}
                hideFilterInput
                noDataText="Couldn't find any nodes"
              >
                {Object.values(this.props.nodes.data).map(this.renderNode)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default NodeListView;
