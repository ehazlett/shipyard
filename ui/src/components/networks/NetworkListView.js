import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

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
        <Td column="ID" className="collapsing">{network.Id.substring(0, 12)}</Td>
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
      <Segment basic>
        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column width={10} textAlign="right" />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              {error && (<Message error>{error}</Message>)}
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['ID', 'Name', 'Driver', 'Scope']}
                hideFilterInput
                noDataText="Couldn't find any networks"
              >
                {Object.keys(networks).map( key => this.renderNetwork(networks[key]) )}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default NetworkListView;
