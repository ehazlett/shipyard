import React from 'react';

import { Message, Input, Grid } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';
import { Link } from 'react-router';

import { listAccounts } from '../../api';

class AccountListView extends React.Component {
  state = {
    error: null,
    accounts: [],
    loading: true,
  };

  componentDidMount() {
    listAccounts()
      .then((accounts) => {
        this.setState({
          error: null,
          accounts: accounts.body,
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

  renderAccount = (account) => {
    return (
      <Tr key={account.id}>
        <Td column="Username">
          <Link to={`/accounts/inspect/${account.username}`}>{account.username}</Link>
        </Td>
        <Td column="First Name">{account.first_name}</Td>
        <Td column="Last Name">{account.last_name}</Td>
        <Td column="Roles">{account.roles.join(', ')}</Td>
      </Tr>
    );
  };

  render() {
    const { loading, error, accounts } = this.state;

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
              <Button as={Link} to="/accounts/create" color="green" icon="add" content="Create" /> :
              <span>
                <b>{selected.length} Accounts Selected: </b>
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
              filterable={["Username", "First Name", "Last Name", "Roles"]}
              hideFilterInput
              noDataText="Couldn't find any accounts"
            >
              {Object.keys(accounts).map( key => this.renderAccount(accounts[key]) )}
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default AccountListView;
