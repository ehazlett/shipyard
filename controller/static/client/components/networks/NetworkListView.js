import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';

const NetworkListView = React.createClass({
  componentDidMount() {
    this.props.fetchNetworks();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

  renderNetwork(network) {
    return (
      <Tr key={network.Id}>
        <Td column="ID" className="collapsing">{network.Id.substring(0, 12)}</Td>
        <Td column="Name">{network.Name}</Td>
        <Td column="Driver">{network.Driver}</Td>
        <Td column="Scope">{network.Scope}</Td>
      </Tr>
    );
  },

  render() {
    return (
      <Container>
        <Grid>
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide">
            </Column>
          </Row>
          <Row>
            <Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable table"
                sortable
                filterable={['ID', 'Name', 'Driver', 'Scope']}
                hideFilterInput
                noDataText="Couldn't find any networks"
              >
                {this.props.networks.map(this.renderNetwork)}
              </Table>
            </Column>
          </Row>
        </Grid>
      </Container>
    );
  },
});

export default NetworkListView;
