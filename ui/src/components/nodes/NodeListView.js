import React from "react";

import { Button, Icon, Checkbox, /*Input,*/ Grid } from "semantic-ui-react";
import ReactTable from "react-table";
import { Link } from "react-router-dom";
import _ from "lodash";

import Loader from "../common/Loader";
import { listNodes, removeNode } from "../../api";
import { showError } from "../../lib";

class NodeListView extends React.Component {
  state = {
    nodes: [],
    selected: [],
    loading: true
  };

  componentDidMount() {
    this.getNodes()
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

  getNodes = () => {
    return listNodes()
      .then(nodes => {
        this.setState({
          nodes: nodes.body
        });
      })
      .catch(err => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeNode);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getNodes();
      })
      .catch(err => {
        showError(err);
        this.getNodes();
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
    const { loading, selected, nodes } = this.state;

    if (loading) {
      return <Loader />;
    }

    const columns = [
      {
        render: row => {
          let selected = this.state.selected.indexOf(row.row.ID) > -1;
          return (
            <Checkbox
              checked={selected}
              onChange={() => {
                this.selectItem(row.row.ID);
              }}
              className={selected ? "active" : ""}
              key={row.row.ID}
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
                `circle ${row.row.Status.State.indexOf("Up") === 0 ? "green" : "red"}`
              }
            />
          );
        },
        sortable: false,
        width: 30
      },
      {
        header: "ID",
        accessor: "ID",
        render: row => {
          return (
            <Link to={`/nodes/inspect/${row.row.ID}`}>
              {row.row.ID.substring(0, 12)}
            </Link>
          );
        },
        sortable: true
      },
      {
        header: "Hostname",
        accessor: "Description.Hostname",
        sortable: true,
        sort: "asc"
      },
      {
        header: "OS",
        id: "OS",
        accessor: d =>
          d.Description.Platform.OS + " " + d.Description.Platform.Architecture,
        sortable: true
      },
      {
        header: "Engine",
        accessor: "Description.Engine.EngineVersion",
        sortable: true
      },
      {
        header: "Type",
        accessor: "ManagerStatus",
        render: row => {
          return <span>{row.row.ManagerStatus ? "Manager" : "Worker"}</span>;
        },
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
              ? <Button color="green" icon="add" content="Add Node" />
              : <span>
                  <b>{selected.length} Nodes Selected: </b>
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
              data={nodes}
              columns={columns}
              defaultPageSize={10}
              minRows={3}
              loadingText='Loading...'
              noDataText='No nodes found. Why not add one?'
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default NodeListView;
