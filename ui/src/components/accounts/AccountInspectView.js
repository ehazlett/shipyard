import React from 'react';

import { Button, Grid } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { Form as FormsyForm } from 'formsy-react';
import { Input, Select } from 'formsy-semantic-ui-react';
import _ from 'lodash';

import Loader from '../common/Loader';

import { updateSpecFromInput, showError, showSuccess } from '../../lib';
import { inspectAccount, updateAccount } from '../../api';
import { accountRoles } from "./AccountFormHelpers";

class AccountInspectView extends React.Component {
  state = {
    account: null,
    loading: true,
    modified: false,
  };

  componentDidMount() {
    this.refresh()
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  refresh = () => {
    const { id } = this.props.match.params;
    return inspectAccount(id)
      .then((account) => {
        this.setState({
          account: account.body,
          modified: false,
        });
      })
      .catch((err) => {
				showError(err);
      });
  }

  saveAccountChanges = () => {
    const { account } = this.state;
    updateAccount(account)
      .then((success) => {
        showSuccess('Successfully updated account');
        this.refresh();
      })
      .catch((err) => {
        showError(err);
      });
  }

  onChangeHandler = (e, input) => {
    this.setState({
      account: _.merge({}, updateSpecFromInput(input, this.state.account)),
      modified: true,
    });
  }

  render() {
    const { loading, account, modified } = this.state;

    if(loading) {
      return <Loader />;
    }

    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={16}>
            <div className="ui breadcrumb">
              <Link to="/accounts" className="section">Accounts</Link>
              <div className="divider"> / </div>
              <div className="active section">{account.username}</div>
            </div>
          </Grid.Column>
          <Grid.Column className="ui sixteen wide basic segment">
            <div className="ui header">Details</div>
            <FormsyForm className="ui form" onValidSubmit={this.saveAccountChanges}>
              <table className="ui very basic celled table">
                <tbody>
                  <tr><td className="four wide column">Id</td><td>{account.id}</td></tr>
                  <tr><td>Username</td><td>{account.username}</td></tr>
                  <tr>
                    <td>First Name</td>
                    <td>
                      <Input
                        name="first_name"
                        placeholder=""
                        value={_.get(account, "first_name", "")}
                        onChange={this.onChangeHandler}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Last Name</td>
                    <td>
                      <Input
                        name="last_name"
                        placeholder=""
                        value={_.get(account, "last_name", "")}
                        onChange={this.onChangeHandler}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Roles</td>
                    <td>
                      <Select
                        name="roles"
                        placeholder="Select user roles"
                        multiple
                        options={accountRoles}
                        value={_.get(account, "roles", [])}
                        onChange={this.onChangeHandler}
                        fluid
                        />
                    </td>
                  </tr>
                </tbody>
              </table>
              <Button color="green" disabled={!modified} onClick={this.saveSettings}>Save Settings</Button>
            </FormsyForm>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default AccountInspectView;
