import React from 'react';

import { Message, Form, Segment } from 'semantic-ui-react';

import { getSwarm, updateSwarm } from '../../api';

class JoinTokensForm extends React.Component {
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
      <Segment basic>
        <Form>
          <Message error/>
          {error && (<Message negative>{error}</Message>)}
          <Form.Input label="Worker" value={swarm.JoinTokens.Worker} readOnly />
          <Form.Input label="Manager" value={swarm.JoinTokens.Manager} readOnly />
          <button className="ui blue button" onClick={this.refreshJoinTokens}>Refresh Join Tokens</button>
        </Form>
      </Segment>
    );
  }
}

export default JoinTokensForm;
