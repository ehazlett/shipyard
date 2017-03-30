import React from "react";

import { Link } from "react-router-dom";
import { Button, /*Input,*/ Grid, Checkbox } from "semantic-ui-react";
import ReactTable from "react-table";
import _ from "lodash";

import Loader from "../common/Loader";
import { listVolumes, removeVolume } from "../../api";
import { showError } from "../../lib";

class VolumeListView extends React.Component {
  state = {
    volumes: [],
    loading: true,
    selected: []
  };

  componentDidMount() {
    this.getVolumes()
      .then(() => {
        this.setState({
          loading: false
        });
      })
      .catch(() => {
        this.setState({
          loading: false
        });
      });
  }

  getVolumes = () => {
    return listVolumes()
      .then(volumes => {
        this.setState({
          volumes: volumes.body.Volumes || []
        });
      })
      .catch(err => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
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
      .catch(err => {
        showError(err);
        this.getVolumes();
      });
  };

  selectItem = id => {
    let i = this.state.selected.indexOf(id);
    if (i > -1) {
      this.setState({
        selected: this.state.selected.slice(i + 1, 1)
      });
    } else {
      this.setState({
        selected: [...this.state.selected, id]
      });
    }
  };

  updateFilter = input => {
    this.refs.table.filterBy(input.target.value);
  };

  render() {
    const { selected, loading, volumes } = this.state;

    if (loading) {
      return <Loader />;
    }

    const columns = [
      {
        render: row => {
          let selected = this.state.selected.indexOf(row.rowValues.Name) > -1;
          return (
            <Checkbox
              checked={selected}
              onChange={() => {
                this.selectItem(row.rowValues.Name);
              }}
              className={selected ? "active" : ""}
              key={row.rowValues.Name}
            />
          );
        },
        sortable: false,
        width: 30
      },
      {
        header: "Driver",
        accessor: "Driver",
        sortable: true
      },
      {
        header: "Name",
        accessor: "Name",
        render: row => {
          return (
            <Link to={`/volumes/inspect/${row.rowValues.Name}`}>
              {row.rowValues.Name}
            </Link>
          );
        },
        sortable: true,
        sort: "asc"
      },
      {
        header: "Scope",
        accessor: "Scope",
        sortable: true
      }
    ];

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            {/*<Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />*/}
          </Grid.Column>
          <Grid.Column width={10} textAlign="right">
            {_.isEmpty(selected)
              ? <Button
                  as={Link}
                  to="/volumes/create"
                  color="green"
                  icon="add"
                  content="Create"
                />
              : <span>
                  <b>{selected.length} Volumes Selected: </b>
                  <Button
                    color="red"
                    onClick={this.removeSelected}
                    content="Remove"
                  />
                </span>}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <ReactTable
              data={volumes}
              columns={columns}
              defaultPageSize={10}
              pageSize={10}
              minRows={0}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default VolumeListView;
