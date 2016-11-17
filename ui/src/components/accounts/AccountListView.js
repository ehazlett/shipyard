import React from 'react';

import { Segment, Grid, Icon } from 'semantic-ui-react';
import { Table, Tr, Td } from 'reactable';

class AccountListView extends React.Component {
  constructor(props) {
    super(props);
    this.updateFilter = this.updateFilter.bind(this);
    this.renderAccount = this.renderAccount.bind(this);
  }

  componentDidMount() {
    this.props.fetchAccounts();
  }

  updateFilter(input) {
    this.refs.table.filterBy(input.target.value);
  }

  renderAccount(account) {
    return (
      <Tr key={account.id}>
        <Td column="Username">{account.username}</Td>
        <Td column="First Name">{account.first_name}</Td>
        <Td column="Last Name">{account.last_name}</Td>
        <Td column="Roles">{account.roles.join(', ')}</Td>
      </Tr>
    );
  }

  render() {
    return (
      <Segment className={`basic ${this.props.accounts.loading ? 'loading' : ''}`}>
        <Grid>
          <Grid.Row>
            <Grid.Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Grid.Column>
            <Grid.Column className="right aligned ten wide" />
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['ID', 'Name', 'Driver', 'Scope']}
                hideFilterInput
                noDataText="Couldn't find any accounts"
              >
                {Object.values(this.props.accounts.data).map(this.renderAccount)}
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default AccountListView;
