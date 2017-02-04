import React from 'react';

import { Button, Checkbox, /*Input,*/ Grid } from 'semantic-ui-react';
import ReactTable from 'react-table';
import { Link } from "react-router-dom";
import _ from 'lodash';

import { listAccounts, removeAccount } from '../../api';
import { showError } from '../../lib';

class AccountListView extends React.Component {
  state = {
    accounts: [],
    selected: [],
    loading: true,
  };

  componentDidMount() {
    this.getAccounts();
  }

  getAccounts = () => {
    return listAccounts()
      .then((accounts) => {
        this.setState({
          accounts: accounts.body,
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
    let promises = _.map(this.state.selected, removeAccount);

    this.setState({
      selected: []
    });

    Promise.all(promises)
      .then(() => {
        this.getAccounts();
      })
      .catch((err) => {
        showError(err);
        this.getAccounts();
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

//  renderAccount = (account) => {
//    let selected = this.state.selected.indexOf(account.id) > -1;
//    return (
//      <Tr className={selected ? "active" : ""} key={account.id}>
//        <Td column="" className="collapsing">
//          <Checkbox checked={selected} onChange={() => { this.selectItem(account.id) }} />
//        </Td>
//        <Td column="Username" value={account.username}>
//          <Link to={`/accounts/inspect/${account.username}`}>{account.username}</Link>
//        </Td>
//        <Td column="First Name">{account.first_name}</Td>
//        <Td column="Last Name">{account.last_name}</Td>
//        <Td column="Roles">{account.roles.join(', ')}</Td>
//      </Tr>
//    );
//  };

  render() {
    const { loading, selected, accounts } = this.state;

    if(loading) {
      return <div></div>;
    }

    const columns = [{
      render: row => {
        let selected = this.state.selected.indexOf(row.row.id) > -1;
        return <Checkbox checked={selected} onChange={() => { this.selectItem(row.row.id) }}
                  className={selected ? "active" : ""} key={row.row.id}/>
      },
      sortable: false
    }, {
      header: 'username',
      accessor: 'username',
      render: row => {
        return <Link to={`/accounts/inspect/${row.row.id}`}>{row.row.username}</Link>
      },
      sortable: true,
      sort: 'asc'
    }, {
      header: 'First Name',
      accessor: 'first_name',
      sortable: true
    }, {
      header: 'Last Name',
      accessor: 'last_name',
      sortable: true
    }, {
      header: 'Roles',
      id: 'Roles',
      accessor: d => d.roles.join(', '),
      sortable: true
    }];

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={6}>
            { /*<Input fluid icon="search" placeholder="Search..." onChange={this.updateFilter} />*/ }
          </Grid.Column>
          <Grid.Column width={10} textAlign="right">
            {
              _.isEmpty(selected) ?
                <Button as={Link} to="/accounts/create" color="green" icon="add" content="Create" /> :
                <span>
                  <b>{selected.length} Accounts Selected: </b>
                  <Button color="red" onClick={this.removeSelected} content="Remove" />
                </span>
            }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <ReactTable
                  data={accounts}
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

export default AccountListView;
