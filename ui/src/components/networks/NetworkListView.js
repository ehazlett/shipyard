import React from 'react';

import { Message, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

import { listNetworks } from '../../api';

class NetworkListView extends React.Component {
  state = {
    error: null,
    networks: [],
    loading: true,
  };

  componentDidMount() {
    listNetworks()
      .then((networks) => {
        this.setState({
          error: null,
          networks: networks.body,
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
  };

  renderNetwork = (network) => {
    return (
      <Tr key={network.Id}>
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
    const { loading, error, networks } = this.state;

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
              <Button as={Link} to="/networks/create" color="green" icon="add" content="Create" /> :
              <span>
                <b>{selected.length} Networks Selected: </b>
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
