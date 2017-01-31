import React from 'react';

import { Link } from "react-router-dom";
import { Button, Input, Grid, Checkbox } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import _ from 'lodash';

import { listVolumes, removeVolume } from '../../api';
import { showError } from '../../lib';

class VolumeListView extends React.Component {
  state = {
    volumes: [],
    loading: true,
    selected: [],
  };

  componentDidMount() {
    this.getVolumes();
  }

  getVolumes = () => {
    return listVolumes()
      .then((volumes) => {
        this.setState({
          volumes: volumes.body.Volumes || [],
          loading: false,
        });
      })
      .catch((err) => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
        this.setState({
          loading: false,
        });
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeVolume);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getVolumes();
      })
      .catch((err) => {
        showError(err);
        this.getVolumes();
      });
  }

  selectItem = (id) => {
    let i = this.state.selected.indexOf(id);
    if (i > -1) {
      this.setState({
        selected: this.state.selected.slice(i+1, 1)
      });
    } else {
      this.setState({
        selected: [...this.state.selected, id]
      });
    }
  }

  updateFilter = (input) => {
    this.refs.table.filterBy(input.target.value);
  };

  renderVolume = (volume) => {
    let selected = this.state.selected.indexOf(volume.Name) > -1;
    return (
      <Tr className={selected ? "active" : ""} key={volume.Name}>
        <Td column="" className="collapsing">
          <Checkbox checked={selected} onChange={() => { this.selectItem(volume.Name) }} />
        </Td>
        <Td column="Driver">{volume.Driver}</Td>
        <Td column="Name" value={volume.Name}><Link to={`/volumes/inspect/${volume.Name}`}>{volume.Name}</Link></Td>
        <Td column="Scope">{volume.Scope}</Td>
      </Tr>
    );
  }

  render() {
    const { selected, loading, volumes } = this.state;

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
            { _.isEmpty(selected) ?
              <Button as={Link} to="/volumes/create" color="green" icon="add" content="Create" /> :
              <span>
                <b>{selected.length} Volumes Selected: </b>
                <Button color="red" onClick={this.removeSelected} content="Remove" />
              </span>
            }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Table
              ref="table"
              className="ui compact celled unstackable table"
              sortable={["Driver", "Name", "Scope"]}
              defaultSort={{column: 'Name', direction: 'asc'}}
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
