import React from 'react';

import { Container, Grid, Message  } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import _ from 'lodash';

import { inspectAccount } from '../../api';

class AccountInspectView extends React.Component {
  state = {
    account: null,
    loading: true,
    error: null
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    inspectAccount(id)
      .then((account) => {
        this.setState({
          error: null,
          account: account.body,
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

  render() {
    const { loading, account, error } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="ui breadcrumb">
                <Link to="/accounts" className="section">Accounts</Link>
                <div className="divider"> / </div>
                <div className="active section">{account.username}</div>
              </div>
            </Grid.Column>
            <Grid.Column className="ui sixteen wide basic segment">
              {error && (<Message error>{error}</Message>)}
              <div className="ui header">Details</div>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">Id</td><td>{account.id}</td></tr>
                  <tr><td>Username</td><td>{account.username}</td></tr>
                  <tr><td>First Name</td><td>{account.first_name}</td></tr>
                  <tr><td>Last Name</td><td>{account.last_name}</td></tr>
                  <tr>
                    <td>Roles</td>
                    <td>{ !_.isEmpty(account.roles) ?
                        account.roles.map((r) =>
                          (
                            <span key={r} className="ui basic label">{r}</span>
                          )
                        ) : 'None' }
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default AccountInspectView;
