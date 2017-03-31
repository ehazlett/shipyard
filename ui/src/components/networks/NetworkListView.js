import React from "react";

import { Button, Checkbox, /*Input,*/ Grid } from "semantic-ui-react";
import ReactTable from "react-table";
import { Link } from "react-router-dom";
import _ from "lodash";

import Loader from "../common/Loader";
import { listNetworks, removeNetwork } from "../../api";
import { showError } from "../../lib";

class NetworkListView extends React.Component {
  state = {
    networks: [],
    selected: [],
    loading: true
  };

  componentDidMount() {
    this.getNetworks()
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

  getNetworks = () => {
    return listNetworks()
      .then(networks => {
        this.setState({
          networks: networks.body,
          loading: false
        });
      })
      .catch(err => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
        this.setState({
          loading: false
        });
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeNetwork);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getNetworks();
      })
      .catch(err => {
        showError(err);
        this.getNetworks();
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
    const { loading, networks, selected } = this.state;

    if (loading) {
      return <Loader />;
    }

    const columns = [
      {
        render: row => {
          let selected = this.state.selected.indexOf(row.row.Id) > -1;
          return (
            <Checkbox
              checked={selected}
              onChange={() => {
                this.selectItem(row.row.Id);
              }}
              className={selected ? "active" : ""}
              key={row.row.Id}
            />
          );
        },
        sortable: false,
        width: 30
      },
      {
        header: "ID",
        accessor: "Id",
        render: row => {
          return (
            <Link to={`/networks/inspect/${row.row.Id}`}>
              {row.row.Id.substring(0, 12)}
            </Link>
          );
        },
        sortable: true
      },
      {
        header: "Name",
        accessor: "Name",
        sortable: true,
        sort: "asc"
      },
      {
        header: "Driver",
        accessor: "Driver",
        sortable: true
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
                  to="/networks/create"
                  color="green"
                  icon="add"
                  content="Create"
                />
              : <span>
                  <b>{selected.length} Networks Selected: </b>
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
              data={networks}
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

export default NetworkListView;
