import React from 'react';

import { Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

class NetworkListView extends React.Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
    this.renderNetwork = this.renderNetwork.bind(this);
  }

  componentDidMount() {
    this.props.fetchNetworks();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderNetwork(network) {
    return (
      <Tr key={network.Id}>
        <Td column="ID" className="collapsing">{network.Id.substring(0, 12)}</Td>
        <Td column="Name">{network.Name}</Td>
        <Td column="Driver">{network.Driver}</Td>
        <Td column="Scope">{network.Scope}</Td>
      </Tr>
    );
  }

  render() {
    return (
      <Segment className={`basic ${this.props.networks.loading ? 'loading' : ''}`}>
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
                filterable={['ID', 'Name', 'Driver', 'Scope']}
                hideFilterInput
                noDataText="Couldn't find any networks"
              >
                {Object.values(this.props.networks.data).map(this.renderNetwork)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default NetworkListView;
