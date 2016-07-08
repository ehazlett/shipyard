import React from 'react';

import { Link } from 'react-router';
import { Grid, Row, Column, Icon } from 'react-semantify';
import { Table, Tr, Td } from 'reactable';

import CreateVolumeForm from './CreateVolumeForm';

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
      <Grid>
        <Row>
          <Column className="six wide">
            <div className="ui fluid icon input">
              <Icon className="search" />
              <input placeholder="Search..." onChange={this.updateFilter}></input>
            </div>
          </Column>
          <Column className="right aligned ten wide">
            <Link to="/volumes/create" className="ui green button">
              <Icon className="add" />
              Create
            </Link>
          </Column>
        </Row>

        {this.createVolumeFormVisible ? <CreateVolumeForm /> : null}

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
    );
  },
});

export default VolumeListView;
