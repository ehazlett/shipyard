import React from 'react';

import { Message, Form, Segment } from 'semantic-ui-react';

import { getSwarm } from '../../api';

class RaftForm extends React.Component {
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
          <Form.Input label="Election tick" value={swarm.Spec.Raft.ElectionTick} type="number" readOnly />
          <Form.Input label="Heartbeat tick" value={swarm.Spec.Raft.HeartbeatTick} type="number" readOnly />
          <Form.Input label="Snapshot interval" value={swarm.Spec.Raft.SnapshotInterval} type="number" readOnly />
          <Form.Input label="Number of old snapshots to keep" value={swarm.Spec.Raft.KeepOldSnapshots} type="number" readOnly />
          <Form.Input label="Log entries for slow followers" value={swarm.Spec.Raft.LogEntriesForSlowFollowers} type="number" readOnly />
        </Form>
      </Segment>
    );
  }
}

export default RaftForm;
