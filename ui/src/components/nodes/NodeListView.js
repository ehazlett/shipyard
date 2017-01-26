import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

import { listNodes } from '../../api';

class NodeListView extends React.Component {
  state = {
    error: null,
    nodes: [],
    loading: true,
  };

  componentDidMount() {
    listNodes()
      .then((nodes) => {
        this.setState({
          error: null,
          nodes: nodes.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  }

  renderNode = (node) => {
    return (
      <Tr key={node.ID}>
        <Td column="" className="collapsing">
          <Icon fitted className={`circle ${node.Status.State === 'ready' ? 'green' : 'red'}`} />
        </Td>
        <Td column="ID" className="collapsing">
          <Link to={`/nodes/inspect/${node.ID}`}>{node.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Hostname">{node.Description.Hostname}</Td>
        <Td column="OS">
          <span>{node.Description.Platform.OS} {node.Description.Platform.Architecture}</span>
        </Td>
        <Td column="Engine">{node.Description.Engine.EngineVersion}</Td>
        <Td column="Type">{node.ManagerStatus ? 'Manager' : 'Worker'}</Td>
      </Tr>
    );
  }

  render() {
    const { loading, error, nodes } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Segment basic>
        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column textAlign="right" width={10}/>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              {error && (<Message error>{error}</Message>)}
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['Hostname', 'OS', 'Engine', 'Type']}
                hideFilterInput
                noDataText="Couldn't find any nodes"
              >
                {Object.keys(nodes).map( key => this.renderNode(nodes[key]) )}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default NodeListView;
