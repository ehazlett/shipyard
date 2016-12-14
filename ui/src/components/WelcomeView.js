import React from 'react';

import { Message, Grid, Header, Form, Container } from 'semantic-ui-react';
import { Redirect } from 'react-router';

import { initSwarm } from '../api/swarm';

export default class WelcomeView extends React.Component {
  state = {
    error: null,
    initialized: false,
  };

  handleSwarmInitSuccess = () => {
    this.setState({
      error: null,
      initialized: true,
    });
  };

  handleSwarmInitError = (error) => {
    error.response.json()
      .then((json) => {
        this.setState({
          error: json.message,
        });
      });
  };

  swarmInit = (e, values) => {
    initSwarm({
      ListenAddr: '0.0.0.0:2377',
      AdvertiseAddr: values.advertiseAddr || null,
      ForceNewCluster: false,
      Spec: {
        Orchestration: {},
        Raft: {},
        Dispatcher: {},
        CAConfig: {}
      }
    })
      .then(this.handleSwarmInitSuccess)
      .catch(this.handleSwarmInitError);

    e.preventDefault();
  };

  render() {
    const { error, initialized } = this.state;
    return (
      <Container className="center middle aligned">
        {initialized && <Redirect to="/" />}
        <Grid centered>
          <Grid.Row>
            <Grid.Column width={8} textAlign="center">
              <Header as="h2">
                <Header.Content>Welcome to Shipyard!</Header.Content>
                <Header.Subheader>To start using Docker Swarm you will need to initialize your swarm cluster, press the button below to get started.</Header.Subheader>
              </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={8}>
              <Form onSubmit={this.swarmInit}>
                <Message error />
                {error && <Message negative>{error}</Message>}
                <Form.Input name="advertiseAddr" label="Advertise Address" placeholder="Auto-detect advertise address" />
                <Form.Button fluid color="green">Initialize</Form.Button>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}
