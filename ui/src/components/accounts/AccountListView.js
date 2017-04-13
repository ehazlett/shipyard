import React from "react";

import { Button, Checkbox, /*Input,*/ Grid } from "semantic-ui-react";
import ReactTable from "react-table";
import { Link } from "react-router-dom";
import _ from "lodash";

import Loader from "../common/Loader";
import { listAccounts, removeAccount } from "../../api";
import { showError } from "../../lib";

class AccountListView extends React.Component {
  state = {
    accounts: [],
    selected: [],
    loading: true
  };

  componentDidMount() {
    this.getAccounts()
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

  getAccounts = () => {
    return listAccounts()
      .then(accounts => {
        this.setState({
          accounts: accounts.body
        });
      })
      .catch(err => {
        /* TODO: If something went wrong here, should probably redirect to an error page. */
        showError(err);
      });
  };

  removeSelected = () => {
    let promises = _.map(this.state.selected, removeAccount);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getAccounts();
      })
      .catch(err => {
        showError(err);
        this.getAccounts();
      });
  };

  selectItem = username => {
    let i = this.state.selected.indexOf(username);
    if (i > -1) {
      this.setState({
        selected: this.state.selected.slice(i + 1, 1)
      });
    } else {
      this.setState({
        selected: [...this.state.selected, username]
      });
    }
  };

  updateFilter = input => {
    this.refs.table.filterBy(input.target.value);
  };

  render() {
    const { loading, selected, accounts } = this.state;

    if (loading) {
      return <Loader />;
    }

    const columns = [
      {
        render: row => {
          let selected = this.state.selected.indexOf(row.row.username) > -1;
          return (
            <Checkbox
              checked={selected}
              onChange={() => {
                this.selectItem(row.row.username);
              }}
              className={selected ? "active" : ""}
              key={row.row.id}
            />
          );
        },
        sortable: false,
        width: 30
      },
      {
        header: "username",
        accessor: "username",
        render: row => {
          return (
            <Link to={`/accounts/inspect/${row.row.username}`}>
              {row.row.username}
            </Link>
          );
        },
        sortable: true,
        sort: "asc"
      },
      {
        header: "First Name",
        accessor: "first_name",
        sortable: true
      },
      {
        header: "Last Name",
        accessor: "last_name",
        sortable: true
      },
      {
        header: "Roles",
        id: "Roles",
        accessor: d => d.roles ? d.roles.join(", ") : "",
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
                  to="/accounts/create"
                  color="green"
                  icon="add"
                  content="Create"
                />
              : <span>
                  <b>{selected.length} Accounts Selected: </b>
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
              data={accounts}
              columns={columns}
              defaultPageSize={10}
              minRows={3}
              loadingText='Loading...'
              noDataText='No accounts found. Why not create one?'
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default AccountListView;
