import React, { PropTypes } from 'react';

import { Segment, Grid, Column, Row, Icon } from 'react-semantify';
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
          <Row>
            <Column className="six wide">
              <div className="ui fluid icon input">
                <Icon className="search" />
                <input placeholder="Search..." onChange={this.updateFilter}></input>
              </div>
            </Column>
            <Column className="right aligned ten wide" />
          </Row>
          <Row>
            <Column className="sixteen wide">
              <Table
                ref="table"
                className="ui compact celled sortable unstackable table"
                sortable
                filterable={['ID', 'Name', 'Driver', 'Scope']}
                hideFilterInput
                noDataText="Couldn't find any accounts"
              >
                {this.props.accounts.data.map(this.renderAccount)}
              </Table>
            </Column>
          </Row>
        </Grid>
      </Segment>
    );
  }
}

// AccountListView.propTypes = {
//   fetchAccounts: PropTypes.func.isRequired,
//   accounts: PropTypes.array.isRequired,
// };

export default AccountListView;
