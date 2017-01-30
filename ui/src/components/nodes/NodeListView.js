import React from 'react';

import { Button, Icon, Checkbox, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';
import _ from 'lodash';

import { listNodes, removeNode } from '../../api';
import { showError } from '../../lib';

class NodeListView extends React.Component {
  state = {
    nodes: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getNodes();
  }

  getNodes = () => {
    return listNodes()
      .then((nodes) => {
        this.setState({
          nodes: nodes.body,
          loading: false,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
        this.setState({
          loading: false,
        });
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeNode);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getNodes();
      })
      .catch((err) => {
        showError(err);
        this.getNodes();
      });
  }

  selectItem = (id) => {
    let i = this.state.selected.indexOf(id);
    if (i > -1) {
      this.setState({
        selected: this.state.selected.slice(i+1, 1)
      });
    } else {
      this.setState({
        selected: [...this.state.selected, id]
      });
    }
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  }

  renderNode = (node) => {
    let selected = this.state.selected.indexOf(node.ID) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={node.ID}>
        <Td column="&nbsp;" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(node.ID) }} />
        </Td>
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
    const { loading, selected, nodes } = this.state;

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
            {
              _.isEmpty(selected) ?
                <Button color="green" icon="add" content="Add Node" /> :
                <span>
                  <b>{selected.length} Nodes Selected: </b>
                  <Button color="red" onClick={this.removeSelected} content="Remove" />
                </span>
            }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
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
