import React from 'react';

import { Message, Form, Segment } from 'semantic-ui-react';

import { getSwarm } from '../../api';

class TaskDefaultsForm extends React.Component {
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
          <Form.Input label="Log Driver" value={swarm.Spec.TaskDefaults.LogDriver ? swarm.Spec.TaskDefaults.LogDriver.Name : ""} />
          {/* TODO: LogDriver Options*/}
        </Form>
      </Segment>
    );
  }
}

export default TaskDefaultsForm;
