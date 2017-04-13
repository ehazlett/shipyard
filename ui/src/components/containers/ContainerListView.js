import React from "react";

import { Button, Checkbox, /*Input,*/ Grid, Icon } from "semantic-ui-react";
import ReactTable from "react-table";
import { Link } from "react-router-dom";
import _ from "lodash";

import Loader from "../common/Loader";
import { listContainers, removeContainer } from "../../api";
import { shortenImageName, showError } from "../../lib";

class ContainerListView extends React.Component {
  state = {
    containers: [],
    selected: [],
    loading: true
  };

  componentDidMount() {
    this.getContainers()
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

  getContainers = () => {
    return listContainers(true)
      .then(containers => {
        this.setState({
          containers: containers.body
        });
      })
      .catch(err => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeContainer);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getContainers();
      })
      .catch(err => {
        showError(err);
        this.getContainers();
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
    const { loading, selected, containers } = this.state;

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
        render: row => {
          return (
            <Icon
              fitted
              className={
                `circle ${row.row.Status.indexOf("Up") === 0 ? "green" : "red"}`
              }
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
            <Link to={`/containers/inspect/${row.row.Id}`}>
              {row.row.Id.substring(0, 12)}
            </Link>
          );
        },
        sortable: true
      },
      {
        header: "Image",
        accessor: "Image",
        render: row => {
          return <span>{shortenImageName(row.row.Image)}</span>;
        },
        sortable: true
      },
      {
        header: "Created",
        accessor: "Created",
        render: row => {
          return (
            <span>{new Date(row.row.Created * 1000).toLocaleString()}</span>
          );
        },
        sortable: true
      },
      {
        header: "Name",
        accessor: "Names[0]",
        render: row => {
          return <span>{row.row.Names[0]}</span>;
        },
        sortable: true,
        sort: "asc"
      }
    ];

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            {/*<Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} /> */}
          </Grid.Column>
          <Grid.Column width={10} textAlign="right">
            {_.isEmpty(selected)
              ? <Button
                  as={Link}
                  to="/containers/create"
                  color="green"
                  icon="add"
                  content="Create"
                />
              : <span>
                  <b>{selected.length} Containers Selected: </b>
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
              data={containers}
              columns={columns}
              defaultPageSize={10}
              minRows={0}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ContainerListView;
