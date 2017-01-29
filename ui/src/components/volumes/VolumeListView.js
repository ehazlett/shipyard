import React from 'react';

import { Link } from 'react-router';
import { Message, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

import { listVolumes } from '../../api';

class VolumeListView extends React.Component {
  state = {
    error: null,
    volumes: [],
    loading: true,
  };

  componentDidMount() {
    listVolumes()
      .then((volumes) => {
        this.setState({
          error: null,
          volumes: volumes.body.Volumes || [],
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

  renderVolume = (volume) => {
    return (
      <Tr key={volume.Name}>
        <Td column="Driver">{volume.Driver}</Td>
        <Td column="Name"><Link to={`/volumes/inspect/${volume.Name}`}>{volume.Name}</Link></Td>
        <Td column="Scope">{volume.Scope}</Td>
      </Tr>
    );
  }

  render() {
    const { loading, error, volumes } = this.state;

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
              <Button as={Link} to="/volumes/create" color="green" icon="add" content="Create" /> :
              <span>
                <b>{selected.length} Volumes Selected: </b>
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
              className="ui compact celled sortable unstackable table"
              sortable
              filterable={[]}
              noDataText="Couldn't find any volumes"
            >
              {Object.keys(volumes).map( key => this.renderVolume(volumes[key]) )}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default VolumeListView;
