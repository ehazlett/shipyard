import React, { PropTypes } from 'react';

import { Segment, Grid, Column, Row, Icon } from 'react-semantify';
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
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide" />
          </Row>
          <Row>
            <Column className="sixteen wide">
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
            </Column>
          </Row>
        </Grid>
      </Segment>
    );
  }
}

// NetworkListView.propTypes = {
//   fetchNetworks: PropTypes.func.isRequired,
//   networks: PropTypes.array.isRequired,
// };

export default NetworkListView;
