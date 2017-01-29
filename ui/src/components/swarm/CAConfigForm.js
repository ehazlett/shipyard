
import React from 'react';

import { Message, Form, Segment } from 'semantic-ui-react';

import { getSwarm } from '../../api';

class CAConfigForm extends React.Component {
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
          <Form.Input label="Node cert expiration time" value={swarm.Spec.CAConfig.NodeCertExpiry} readOnly />
          {/* TODO: ExternalCAs configuration */}
        </Form>
      </Segment>
    );
  }
}

export default CAConfigForm;
