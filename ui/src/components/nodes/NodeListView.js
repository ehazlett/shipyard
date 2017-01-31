import React from 'react';

import { Message, Input, Grid, Icon } from 'semantic-ui-react';
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
        <Td column="ID" value={node.ID} className="collapsing">
          <Link to={`/nodes/inspect/${node.ID}`}>{node.ID.substring(0, 12)}</Link>
        </Td>
        <Td column="Hostname">{node.Description.Hostname}</Td>
        <Td column="OS" value={node.Description.Platform.OS+" "+node.Description.Platform.Architecture}>
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
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            <Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />
          </Grid.Column>
          <Grid.Column width={10} textAlign="right">
            { /* _.isEmpty(selected) ?
              <Button color="green" icon="add" content="Add Node" /> :
              <span>
                <b>{selected.length} Nodes Selected: </b>
                <Button color="red" onClick={this.removeSelected} content="Remove" />
              </span>
            */}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            {error && (<Message error>{error}</Message>)}
            <Table
              ref="table"
              className="ui compact celled unstackable table"
              sortable={["ID", "Hostname", "OS", "Engine", "Type"]}
              defaultSort={{column: 'Hostname', direction: 'asc'}}
              filterable={["ID", "Hostname", "OS", "Engine", "Type"]}
              hideFilterInput
              noDataText="Couldn't find any nodes"
            >
              {Object.keys(nodes).map( key => this.renderNode(nodes[key]) )}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default NodeListView;
