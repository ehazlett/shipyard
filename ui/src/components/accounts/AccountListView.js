import React from 'react';

import { Message, Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

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
        <Td column="Username">{account.username}</Td>
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
      <Segment basic>
        <Grid>
          <Grid.Row>
            <Grid.Column width={6}>
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column width={10} textAlign="right" />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              {error && (<Message error>{error}</Message>)}
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['ID', 'Name', 'Driver', 'Scope']}
                hideFilterInput
                noDataText="Couldn't find any accounts"
              >
                {Object.values(accounts).map(this.renderAccount)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default AccountListView;
