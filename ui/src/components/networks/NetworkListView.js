import React from 'react';

import { Button, Checkbox, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from "react-router-dom";
import _ from 'lodash';

import { listNetworks, removeNetwork } from '../../api';
import { showError } from '../../lib';

class NetworkListView extends React.Component {
  state = {
    networks: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getNetworks();
  }

  getNetworks = () => {
    return listNetworks()
      .then((networks) => {
        this.setState({
          networks: networks.body,
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
    let promises = _.map(this.state.selected, removeNetwork);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getNetworks();
      })
      .catch((err) => {
        showError(err);
        this.getNetworks();
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
  };

  renderNetwork = (network) => {
    let selected = this.state.selected.indexOf(network.Id) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={network.Id}>
        <Td column="" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(network.Id) }} />
        </Td>
        <Td column="Id" value={network.Id} className="collapsing">
          <Link to={`/networks/inspect/${network.Id}`}>{network.Id.substring(0, 12)}</Link>
        </Td>
        <Td column="Name">{network.Name}</Td>
        <Td column="Driver">{network.Driver}</Td>
        <Td column="Scope">{network.Scope}</Td>
      </Tr>
    );
  };

  render() {
    const { loading, networks, selected } = this.state;

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
                <Button as={Link} to="/networks/create" color="green" icon="add" content="Create" /> :
                <span>
                  <b>{selected.length} Networks Selected: </b>
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
              sortable={['Id', 'Name', 'Driver', 'Scope']}
              defaultSort={{column: 'Name', direction: 'asc'}}
              filterable={['Id', 'Name', 'Driver', 'Scope']}
              hideFilterInput
              noDataText="Couldn't find any networks"
            >
              {Object.keys(networks).map( key => this.renderNetwork(networks[key]) )}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default NetworkListView;
