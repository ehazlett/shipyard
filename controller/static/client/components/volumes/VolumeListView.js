import React from 'react';

import { Grid, Row, Column, Container, Dropdown, Item, Menu, Button, Icon } from 'react-semantify';
import { Table, Tbody, Tr, Td, Thead, Th } from 'reactable';

const VolumeListView = React.createClass({
  componentDidMount() {
    this.props.fetchVolumes();
  },

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  },

	                    renderVolume(volume) {
		                    return (
			<Tr key={volume.Name}>
        <Td column="Driver">{volume.Driver}</Td>
        <Td column="Name">{volume.Name}</Td>
        <Td column="Scope">{volume.Scope}</Td>
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
              <Button className="green" onClick={this.props.showCreateVolumeModal}>
                <Icon className="add" />
                Create
              </Button>
            </Column>
          </Row>
          <Row>
            <Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable table"
                sortable
                filterable={[]}
                noDataText="Couldn't find any volumes"
              >
                {this.props.volumes ? this.props.volumes.map(this.renderVolume) : []}
              </Table>
            </Column>
          </Row>
        </Grid>
      </Container>
    );
  },
});

export default VolumeListView;
