import React from 'react';

import { Container, Grid, Column, Row, Input, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';
import { Link } from 'react-router';

const ContainerListView = React.createClass({
  componentDidMount() {
    this.props.fetchContainers();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

  renderContainer(container) {
    return (
      <Tr key={container.Id}>
        <Td column="" className="collapsing">
          <Icon className={'circle ' + (container.Status.indexOf('Up') === 0 ? 'green' : 'red')}></Icon>
        </Td>
        <Td column="ID" className="collapsing"><Link to={"/containers/" + container.Id}>{container.Id.substring(0, 12)}</Link></Td>
        <Td column="Image">{container.Image}</Td>
        <Td column="Command">{container.Command}</Td>
        <Td column="Created" className="collapsing">{new Date(container.Created * 1000).toLocaleString()}</Td>
        <Td column="Status">{container.Status}</Td>
        <Td column="Name">{container.Names[0]}</Td>
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
                sortable={true}
                filterable={['ID', 'Image', 'Command', 'Created', 'Status', 'Name']}
                hideFilterInput
                noDataText="Couldn't find any containers">
                {this.props.containers ? this.props.containers.map(this.renderContainer) : []}
              </Table>
            </Column>
          </Row>
        </Grid>
      </Container>
    );
  }
});

export default ContainerListView;
