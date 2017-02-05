import React from 'react';

import { Button, Divider, Container, Segment, Grid, Menu } from 'semantic-ui-react';
import { Redirect, Switch, Route, Link } from 'react-router-dom';
import _ from 'lodash';

import JoinTokensForm from '../swarm/JoinTokensForm';
import RaftForm from '../swarm/RaftForm';
import TaskDefaultsForm from '../swarm/TaskDefaultsForm';
import CAConfigForm from '../swarm/CAConfigForm';
import EncryptionForm from '../swarm/EncryptionForm';
import DispatcherForm from '../swarm/DispatcherForm';

import { getSwarm, updateSwarm } from '../../api';
import { showSuccess, showError } from '../../lib';


class SettingsView extends React.Component {
  state = {
    swarm: null,
    loading: true,
    modified: false,
  };

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    getSwarm()
      .then((swarm) => {
        this.setState({
          swarm: swarm.body,
          loading: false,
          modified: false,
        });
      })
      .catch((err) => {
        showError(err);
        this.setState({
          loading: false,
          modified: false,
        });
      });
  };

  onChangeHandler = (e, updatedState) => {
    this.setState({
      swarm: _.merge({}, this.state.swarm, { Spec: updatedState }),
      modified: true,
    });
  }

  saveSettings = () => {
    const { swarm } = this.state;
    updateSwarm(swarm.Spec, swarm.Version.Index)
      .then((success) => {
        showSuccess('Successfully updated swarm settings');
        this.refresh();
      })
      .catch((err) => {
        showError(err);
      });
  }

  render() {
    const { location } = this.props;
    const { swarm, loading, modified } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Segment basic>
                <Menu pointing secondary>
                  <Menu.Item name='Join Tokens' as={Link} to="/settings/tokens" active={location.pathname.indexOf("/settings/tokens") === 0} />
                  <Menu.Item name='Raft' as={Link} to="/settings/raft" active={location.pathname.indexOf("/settings/raft") === 0} />
                  <Menu.Item name='TaskDefaults' as={Link} to="/settings/taskdefaults" active={location.pathname.indexOf("/settings/taskdefaults") === 0} />
                  <Menu.Item name='CAConfig' as={Link} to="/settings/caconfig" active={location.pathname.indexOf("/settings/caconfig") === 0} />
                  <Menu.Item name='Encryption' as={Link} to="/settings/encryption" active={location.pathname.indexOf("/settings/encryption") === 0} />
                  <Menu.Item name='Dispatcher' as={Link} to="/settings/dispatcher" active={location.pathname.indexOf("/settings/dispatcher") === 0} />
                </Menu>

                <Switch>
                  <Route exact path="/settings/tokens" component={() => <JoinTokensForm swarm={swarm} onChange={this.onChangeHandler} />} />
                  <Route exact path="/settings/raft" component={() => <RaftForm swarm={swarm} onChange={this.onChangeHandler} />} />
                  <Route exact path="/settings/taskdefaults" component={() => <TaskDefaultsForm swarm={swarm} onChange={this.onChangeHandler} />} />
                  <Route exact path="/settings/caconfig" component={() => <CAConfigForm swarm={swarm} onChange={this.onChangeHandler} />} />
                  <Route exact path="/settings/encryption" component={() => <EncryptionForm swarm={swarm} onChange={this.onChangeHandler} />} />
                  <Route exact path="/settings/dispatcher" component={() => <DispatcherForm swarm={swarm} onChange={this.onChangeHandler} />} />
                  <Route render={() => <Redirect to="/settings/tokens" />} />
                </Switch>

                <Divider hidden />

                { modified && <Button color="green" onClick={this.saveSettings}>Save Settings</Button> }
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default SettingsView;
