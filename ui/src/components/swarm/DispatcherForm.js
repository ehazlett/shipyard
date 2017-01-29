import React from 'react';

import { Message, Form, Segment } from 'semantic-ui-react';

import { getSwarm } from '../../api';

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

  render() {
    const { swarm, error, loading } = this.state;

    if(loading) {
      return <div></div>;
    }

    let dispatcher = swarm.Spec.Dispatcher;

    return (
      <Segment basic>
        <Form>
          <Message error/>
          {error && (<Message negative>{error}</Message>)}
          <Form.Input label="HeartbeatPeriod" value={dispatcher ? dispatcher.HeartbeatPeriod : ""} type="number" readOnly/>
        </Form>
      </Segment>
    );
  }
}

export default SettingsView;
