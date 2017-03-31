import React from "react";

import { Form, Segment } from "semantic-ui-react";

import { getSwarm, updateSwarm } from "../../api";
import { showSuccess, showError } from "../../lib";

class JoinTokensForm extends React.Component {
  state = {
    swarm: null,
    loading: true
  };

  componentDidMount() {
    this.getSwarmSettings();
  }

  getSwarmSettings = () => {
    getSwarm()
      .then(swarm => {
        this.setState({
          swarm: swarm.body,
          loading: false
        });
      })
      .catch(err => {
        showError(err);
        this.setState({
          loading: false
        });
      });
  };

  refreshJoinTokens = (
    rotateManagerToken = false,
    rotateWorkerToken = false
  ) => {
    const { swarm } = this.state;
    updateSwarm(
      swarm.Spec,
      swarm.Version.Index,
      rotateManagerToken,
      rotateWorkerToken
    )
      .then(success => {
        this.getSwarmSettings();
        showSuccess("Successfully refreshed swarm token");
      })
      .catch(err => {
        showError(err);
        this.setState({
          loading: false
        });
      });
  };

  refreshManagerToken = e => {
    e.preventDefault();
    this.refreshJoinTokens(true, false);
  };

  refreshWorkerToken = e => {
    e.preventDefault();
    this.refreshJoinTokens(false, true);
  };

  render() {
    const { swarm, loading } = this.state;

    if (loading) {
      return <div />;
    }

    return (
      <Segment basic>
        <Form>
          <Form.Input
            label="Worker"
            value={swarm.JoinTokens.Worker}
            readOnly
            action={{
              color: "blue",
              content: "Refresh Token",
              onClick: this.refreshWorkerToken
            }}
          />
          <Form.Input
            label="Manager"
            value={swarm.JoinTokens.Manager}
            readOnly
            action={{
              color: "blue",
              content: "Refresh Token",
              onClick: this.refreshManagerToken
            }}
          />
        </Form>
      </Segment>
    );
  }
}

export default JoinTokensForm;
