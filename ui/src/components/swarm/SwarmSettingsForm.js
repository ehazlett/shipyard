import React from 'react';

import { Message, Form, Segment, Header } from 'semantic-ui-react';

import { getSwarm, updateSwarm } from '../../api';

class SettingsView extends React.Component {
  state = {
    swarm: null,
    error: null,
    loading: true,
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

  refreshJoinTokens = (e) => {
    const rotateManagerToken = true;
    const rotateWorkerToken = true;
    const { swarm } = this.state;
    updateSwarm(swarm.Spec, swarm.Version.Index, rotateManagerToken, rotateWorkerToken)
      .then((success) => {
        this.getSwarmSettings();
      })
      .catch((error) => {
        this.setState({
          error,
          loading: false,
        });
      });
    e.preventDefault();
  };

  render() {
    const { swarm, error, loading } = this.state;

    if(loading) {
      return <div></div>;
    }

    return (
      <Form>
        <Message error/>
        {error && (<Message negative>{error}</Message>)}
        <Segment className="basic">
          <Header>Join Tokens</Header>
          <Form.Field>
            <label>Worker</label>
            <input value={swarm.JoinTokens.Worker} readOnly />
          </Form.Field>
          <Form.Field>
            <label>Manager</label>
            <input value={swarm.JoinTokens.Manager} readOnly />
          </Form.Field>
          <button className="ui blue button" onClick={this.refreshJoinTokens}>Refresh Join Tokens</button>
        </Segment>
      </Form>
    );
  }
}

export default SettingsView;
