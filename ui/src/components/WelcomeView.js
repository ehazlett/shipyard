import React from "react";

import {
  Accordion,
  Icon,
  Grid,
  Header,
  Form,
  Container
} from "semantic-ui-react";
import { Form as FormsyForm } from "formsy-react";
import { Redirect } from "react-router-dom";

import { initSwarm } from "../api/swarm";
import { showError, showSuccess } from "../lib";

export default class WelcomeView extends React.Component {
  state = {
    initialized: false
  };

  handleSwarmInitSuccess = () => {
    this.setState({
      initialized: true
    });
    showSuccess("Successfully initialized swarm mode");
  };

  handleSwarmInitError = err => {
    showError(err);
  };

  swarmInit = values => {
    initSwarm({
      ListenAddr: "0.0.0.0:2377",
      AdvertiseAddr: values.AdvertiseAddr || null,
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
  };

  render() {
    const { initialized } = this.state;
    return (
      <Container className="center middle aligned">
        {initialized && <Redirect to="/" />}
        <FormsyForm
          className="ui form"
          onValidSubmit={this.swarmInit}
          noValidate
        >
          <Grid centered>
            <Grid.Row>
              <Grid.Column width={8} textAlign="center">
                <Header as="h2">
                  <Header.Content>Welcome to Shipyard!</Header.Content>
                  <Header.Subheader>
                    To start using Docker Swarm you will need to initialize your swarm cluster, press the button below to get started.
                  </Header.Subheader>
                </Header>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <Accordion fluid styled>
                  <Accordion.Title>
                    <Icon name="dropdown" />
                    Advanced Options
                  </Accordion.Title>
                  <Accordion.Content>
                    <Form.Input
                      name="AdvertiseAddr"
                      label="Advertise Address"
                      placeholder="Auto-detect advertise address"
                    />
                  </Accordion.Content>
                </Accordion>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={8}>
                <Form.Button fluid color="green">Initialize</Form.Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </FormsyForm>
      </Container>
    );
  }
}
