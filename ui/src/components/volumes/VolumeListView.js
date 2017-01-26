import React from 'react';

import { Link } from 'react-router';
import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
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
      <Segment basic>
        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column width={10} textAlign="right">
              <Link to="/volumes/create" className="ui green button">
                <Icon className="add" />
                Create
              </Link>
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
      </Segment>
    );
  }
}

export default VolumeListView;
