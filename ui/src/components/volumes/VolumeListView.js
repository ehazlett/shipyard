import React from 'react';

import { Link } from 'react-router';
import { Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

import CreateVolumeForm from './CreateVolumeForm';

class VolumeListView extends React.Component {
  componentDidMount() {
    this.props.fetchVolumes();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderVolume(volume) {
    return (
      <Tr key={volume.Name}>
        <Td column="Driver">{volume.Driver}</Td>
        <Td column="Name">{volume.Name}</Td>
        <Td column="Scope">{volume.Scope}</Td>
      </Tr>
    );
  }

  render() {
    return (
      <Segment className={`basic ${this.props.volumes.loading ? 'loading' : ''}`}>
        <Grid>
          <Grid.Row>
            <Grid.Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column className="right aligned ten wide">
              <Link to="/volumes/create" className="ui green button">
                <Icon className="add" />
                Create
              </Link>
            </Grid.Column>
          </Grid.Row>

          {this.createVolumeFormVisible ? <CreateVolumeForm /> : null}

          <Grid.Row>
            <Grid.Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={[]}
                noDataText="Couldn't find any volumes"
              >
                {Object.values(this.props.volumes.data).map(this.renderVolume)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default VolumeListView;
