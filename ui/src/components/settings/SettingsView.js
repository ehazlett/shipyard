import React from 'react';

import { Segment, Message, Grid, Menu } from 'semantic-ui-react';
import moment from 'moment';

import JoinTokensForm from '../swarm/JoinTokensForm';
import RaftForm from '../swarm/RaftForm';
import TaskDefaultsForm from '../swarm/TaskDefaultsForm';
import CAConfigForm from '../swarm/CAConfigForm';
import EncryptionForm from '../swarm/EncryptionForm';
import DispatcherForm from '../swarm/DispatcherForm';

import { getSwarm } from '../../api';


class SettingsView extends React.Component {
  state = {
    swarm: null,
    error: null,
    loading: true,
    activeSegment: 'join tokens',
  };

  componentDidMount() {
    this.getSwarmSettings();
  }

  getSwarmSettings = () => {
    getSwarm()
      .then((swarm) => {
        this.setState({
          error: null,
          swarm: swarm.body,
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });
  };

  changeSegment = (name) => {
    this.setState({
      activeSegment: name,
    });
  };

  render() {
    var { swarm, loading, error, activeSegment } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Grid>
        <Grid.Column width={16}>
          <Segment basic>
            {error && (<Message error>{error}</Message>)}
            <table className="ui very basic compact celled table">
              <tbody>
                <tr><td>Name</td><td>{swarm.Spec.Name}</td></tr>
                <tr><td>Created</td><td>{moment(swarm.CreatedAt).toString()}</td></tr>
                <tr><td>Last Updated</td><td>{moment(swarm.UpdatedAt).toString()}</td></tr>
              </tbody>
            </table>
          </Segment>
        </Grid.Column>
        <Grid.Column width={16}>
          <Menu pointing secondary>
            <Menu.Item name='Join Tokens' active={activeSegment === 'join tokens'} onClick={() => { this.changeSegment('join tokens'); }} />
            <Menu.Item name='Raft' active={activeSegment === 'raft'} onClick={() => { this.changeSegment('raft'); }} />
            <Menu.Item name='TaskDefaults' active={activeSegment === 'taskdefaults'} onClick={() => { this.changeSegment('taskdefaults'); }} />
            <Menu.Item name='CAConfig' active={activeSegment === 'caconfig'} onClick={() => { this.changeSegment('caconfig'); }} />
            <Menu.Item name='Encryption' active={activeSegment === 'encryption'} onClick={() => { this.changeSegment('encryption'); }} />
            <Menu.Item name='Dispatcher' active={activeSegment === 'dispatcher'} onClick={() => { this.changeSegment('dispatcher'); }} />
          </Menu>

          {/* TODO: Fetch the swarm config once at the SettingsView level and pass it into the child forms */}
          { activeSegment === 'join tokens' ? <JoinTokensForm /> : null }
          { activeSegment === 'raft' ? <RaftForm /> : null }
          { activeSegment === 'taskdefaults' ? <TaskDefaultsForm /> : null }
          { activeSegment === 'caconfig' ? <CAConfigForm /> : null }
          { activeSegment === 'encryption' ? <EncryptionForm /> : null }
          { activeSegment === 'dispatcher' ? <DispatcherForm /> : null }
        </Grid.Column>
      </Grid>
    );
  }
}

export default SettingsView;
